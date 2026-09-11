import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../services';
import { formatCurrency, formatDate, formatError } from '../utils/helpers';
import type { Product } from '../types';
import { ArrowLeft, Edit } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadProduct(id); }, [id]);

  const loadProduct = async (pid: string) => {
    try { setLoading(true); setProduct(await productApi.getProduct(pid)); }
    catch { navigate('/products'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return null;

  const isLow = product.currentStock <= product.minStockAlert;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/products')} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-outline text-sm"><Edit className="w-4 h-4" /> Edit</button>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">Product</p>
            <h1 className="text-2xl font-display font-bold text-surface-900">{product.name}</h1>
          </div>
          {isLow && <span className="badge badge-accounts">Low Stock</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div><p className="eyebrow text-[8px] mb-1">SKU</p><p className="text-sm font-mono text-surface-900">{product.sku}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Category</p><p className="text-sm text-surface-900">{product.category}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Unit Price</p><p className="text-lg font-display font-bold text-primary">{formatCurrency(product.unitPrice)}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Current Stock</p><p className={`text-lg font-display font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>{product.currentStock}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Min Stock Alert</p><p className="text-sm text-surface-500">{product.minStockAlert}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Location</p><p className="text-sm text-surface-900">{product.location || '—'}</p></div>
          <div><p className="eyebrow text-[8px] mb-1">Created</p><p className="text-sm font-mono text-surface-500">{formatDate(product.createdAt)}</p></div>
        </div>
      </div>
    </div>
  );
};
