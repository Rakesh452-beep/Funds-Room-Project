import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerApi } from '../services';
import { formatDate, getStatusColor, formatError } from '../utils/helpers';
import type { Customer } from '../types';
import { ArrowLeft, Edit } from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadCustomer(id); }, [id]);

  const loadCustomer = async (cid: string) => {
    try { setLoading(true); setCustomer(await customerApi.getCustomer(cid)); }
    catch { navigate('/customers'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/customers')} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={() => navigate(`/customers/${id}/edit`)} className="btn-outline text-sm"><Edit className="w-4 h-4" /> Edit</button>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">Customer</p>
            <h1 className="text-2xl font-display font-bold text-surface-900">{customer.name}</h1>
          </div>
          <span className={`badge ${getStatusColor(customer.status)}`}>{customer.status}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div><p className="eyebrow text-[8px] mb-1">Business Name</p><p className="text-sm font-medium text-surface-900">{customer.businessName}</p></div>
            <div><p className="eyebrow text-[8px] mb-1">Mobile</p><p className="text-sm font-mono text-surface-900">{customer.mobile}</p></div>
            <div><p className="eyebrow text-[8px] mb-1">Email</p><p className="text-sm font-mono text-surface-900">{customer.email || '—'}</p></div>
            <div><p className="eyebrow text-[8px] mb-1">Address</p><p className="text-sm text-surface-900">{customer.address || '—'}</p></div>
          </div>
          <div className="space-y-4">
            <div><p className="eyebrow text-[8px] mb-1">GST Number</p><p className="text-sm font-mono text-surface-900">{customer.gstNumber || '—'}</p></div>
            <div><p className="eyebrow text-[8px] mb-1">Customer Type</p><p className="text-sm text-surface-900">{customer.customerType}</p></div>
            <div><p className="eyebrow text-[8px] mb-1">Created</p><p className="text-sm font-mono text-surface-500">{formatDate(customer.createdAt)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
