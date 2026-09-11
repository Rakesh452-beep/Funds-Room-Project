import { useEffect, useState, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { customerApi } from '../services';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { getStatusColor, getInitials, formatError } from '../utils/helpers';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';
import { Loading } from '../components/Loading';

const emptyForm = {
  name: '',
  mobile: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'RETAIL' as CustomerType,
  address: '',
  status: 'LEAD' as CustomerStatus,
  followUpDate: '',
};

export const CustomerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      customerApi
        .getCustomer(id)
        .then((c) => {
          setForm({
            name: c.name,
            mobile: c.mobile,
            email: c.email,
            businessName: c.businessName,
            gstNumber: c.gstNumber || '',
            customerType: c.customerType,
            address: c.address,
            status: c.status,
            followUpDate: c.followUpDate ? c.followUpDate.slice(0, 10) : '',
          });
        })
        .catch((err) => showToast(formatError(err, 'Error loading customer'), 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        gstNumber: form.gstNumber || undefined,
        followUpDate: form.followUpDate || undefined,
      };
      if (isEdit) {
        await customerApi.updateCustomer(id!, payload);
        showToast('Customer updated successfully');
        navigate(`/customers/${id}`);
      } else {
        const res = await customerApi.createCustomer(payload);
        showToast('Customer created successfully');
        navigate(`/customers/${res.data.id}`);
      }
    } catch (err) {
      showToast(formatError(err, 'Error saving customer'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const inputClass = 'input';
  const labelClass = 'eyebrow block mb-1.5';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-surface-900">
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </h3>
        <p className="text-sm text-surface-500 mt-1">
          {isEdit ? 'Update the customer details below' : 'Fill in the details to add a CRM customer'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Customer Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className={inputClass} required placeholder="e.g. Rajesh Kumar" />
          </div>
          <div>
            <label className={labelClass}>Business Name *</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} className={inputClass} required placeholder="e.g. Sharma Traders" />
          </div>
          <div>
            <label className={labelClass}>Mobile Number *</label>
            <input name="mobile" value={form.mobile} onChange={handleChange} className={inputClass} required placeholder="e.g. 9876543210" pattern="[0-9+ -]{10,15}" />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} required placeholder="e.g. rajesh@company.com" />
          </div>
          <div>
            <label className={labelClass}>GST Number</label>
            <input name="gstNumber" value={form.gstNumber} onChange={handleChange} className={inputClass} placeholder="e.g. 29ABCDE1234F1Z5" />
          </div>
          <div>
            <label className={labelClass}>Customer Type *</label>
            <select name="customerType" value={form.customerType} onChange={handleChange} className={inputClass}>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Follow-up Date</label>
            <input type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} className={inputClass} rows={2} required placeholder="Full address" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFormPage;
