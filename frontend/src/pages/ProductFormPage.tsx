import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../services';
import { useToast } from '../components/Toast';
import { Loading } from '../components/Loading';
import { formatError } from '../utils/helpers';

const emptyForm = {
  name: '',
  sku: '',
  category: '',
  unitPrice: '',
  currentStock: '',
  minStockAlert: '',
  location: '',
};

interface StockMovementForm {
  quantityChanged: string;
  movementType: 'IN' | 'OUT';
  reason: string;
}

const emptyMovement: StockMovementForm = {
  quantityChanged: '',
  movementType: 'IN',
  reason: '',
};

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [movement, setMovement] = useState<StockMovementForm>(emptyMovement);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      productApi
        .getProduct(id)
        .then((p) => {
          setForm({
            name: p.name,
            sku: p.sku,
            category: p.category,
            unitPrice: String(p.unitPrice),
            currentStock: String(p.currentStock),
            minStockAlert: String(p.minStockAlert),
            location: p.location,
          });
          setProductName(p.name);
        })
        .catch((err) => showToast(formatError(err, 'Product not found'), 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unitPrice: parseFloat(form.unitPrice),
        currentStock: parseInt(form.currentStock) || 0,
        minStockAlert: parseInt(form.minStockAlert) || 0,
        location: form.location,
      };

      if (isEdit) {
        await productApi.updateProduct(id!, payload);
        showToast('Product updated');
        navigate(`/products/${id}`);
      } else {
        const res = await productApi.createProduct(payload);
        showToast('Product created');
        navigate(`/products/${res.data.id}`);
      }
    } catch (err) {
      showToast(formatError(err, 'Failed to save product'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMovement = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.logStockMovement(id!, {
        quantityChanged: parseInt(movement.quantityChanged),
        movementType: movement.movementType,
        reason: movement.reason,
      });
      showToast('Stock movement logged');
      setMovement(emptyMovement);
      const p = await productApi.getProduct(id!);
      setForm((f) => ({ ...f, currentStock: String(p.currentStock) }));
    } catch (err) {
      showToast(formatError(err, 'Failed to update stock'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const labelClass = 'eyebrow block mb-1.5';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h3 className="text-xl font-semibold text-surface-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
        <p className="text-sm text-surface-500 mt-1">{isEdit ? 'Update product details' : 'Add a product to your inventory'}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" required placeholder="e.g. Premium Basmati Rice" />
          </div>
          <div>
            <label className={labelClass}>SKU / Code *</label>
            <input name="sku" value={form.sku} onChange={handleChange} className="input" required placeholder="e.g. RICE-BSM-001" />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <input name="category" value={form.category} onChange={handleChange} className="input" required placeholder="e.g. Grains" />
          </div>
          <div>
            <label className={labelClass}>Unit Price (₹) *</label>
            <input type="number" min="0.01" step="0.01" name="unitPrice" value={form.unitPrice} onChange={handleChange} className="input" required placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Current Stock</label>
            <input type="number" min="0" name="currentStock" value={form.currentStock} onChange={handleChange} className="input" disabled={isEdit} placeholder="0" />
          </div>
          <div>
            <label className={labelClass}>Min Stock Alert</label>
            <input type="number" min="0" name="minStockAlert" value={form.minStockAlert} onChange={handleChange} className="input" required placeholder="10" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Location / Warehouse *</label>
            <input name="location" value={form.location} onChange={handleChange} className="input" required placeholder="e.g. Warehouse A - Rack 1" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 mb-1">Update Stock ({productName})</h3>
          <p className="text-sm text-surface-500 mb-4">Record an IN or OUT stock movement</p>
          <form onSubmit={handleMovement} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex rounded-xl overflow-hidden border border-surface-300">
              <button
                type="button"
                onClick={() => setMovement({ ...movement, movementType: 'IN' })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${movement.movementType === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-surface-100 text-surface-500'}`}
              >
                + IN
              </button>
              <button
                type="button"
                onClick={() => setMovement({ ...movement, movementType: 'OUT' })}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${movement.movementType === 'OUT' ? 'bg-red-50 text-red-600' : 'bg-surface-100 text-surface-500'}`}
              >
                − OUT
              </button>
            </div>
            <input
              type="number"
              min="1"
              value={movement.quantityChanged}
              onChange={(e) => setMovement({ ...movement, quantityChanged: e.target.value })}
              className="input"
              placeholder="Quantity"
              required
            />
            <input
              value={movement.reason}
              onChange={(e) => setMovement({ ...movement, reason: e.target.value })}
              className="input"
              placeholder="Reason (e.g. new stock, damaged)"
              required
            />
            <div className="sm:col-span-3 flex justify-end">
              <button type="submit" disabled={saving} className={`btn-primary ${movement.movementType === 'OUT' ? '!from-red-600 !to-red-700' : ''}`}>
                {saving ? 'Updating...' : `Log ${movement.movementType} Movement`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
