import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../services';
import { formatCurrency, formatDate, formatError } from '../utils/helpers';
import type { Product } from '../types';
import { ArrowLeft, Edit, ImagePlus, Loader2 } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (id) loadProduct(id); }, [id]);

  const loadProduct = async (pid: string) => {
    try { setLoading(true); setProduct(await productApi.getProduct(pid)); }
    catch { navigate('/products'); }
    finally { setLoading(false); }
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      await productApi.uploadImage(id, file);
      await loadProduct(id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Upload failed. S3 may not be configured on this deployment.';
      alert(msg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-surface-200 bg-surface-50 flex items-center justify-center shrink-0">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{product.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="eyebrow mb-1">Product</p>
              <h1 className="text-2xl font-display font-bold text-surface-900">{product.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-outline text-sm">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />} {uploading ? 'Uploading…' : product.imageUrl ? 'Replace image' : 'Add image'}
            </button>
            {isLow && <span className="badge badge-accounts">Low Stock</span>}
          </div>
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
