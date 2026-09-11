import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services';
import { formatCurrency, formatError } from '../utils/helpers';
import type { Product } from '../types';
import { Plus, Search, Eye, Edit } from 'lucide-react';

export const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try { setLoading(true); setProducts(await productApi.getProducts()); }
    catch (e: any) { setError(formatError(e, 'Failed to load products')); }
    finally { setLoading(false); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><div className="eyebrow mb-1">Inventory</div><h1 className="text-2xl font-display font-bold text-surface-900">Products</h1></div>
        <Link to="/products/new" className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Product</Link>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input !pl-9" placeholder="Search by name or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-header">Name</th><th className="table-header">SKU</th><th className="table-header">Price</th><th className="table-header">Stock</th><th className="table-header">Min Stock</th><th className="table-header">Actions</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-surface-200 hover:bg-surface-100 transition-colors">
                    <td className="table-cell"><Link to={`/products/${p.id}`} className="text-surface-900 hover:text-primary font-medium transition-colors">{p.name}</Link></td>
                    <td className="table-cell font-mono text-xs">{p.sku}</td>
                    <td className="table-cell font-mono text-xs">{formatCurrency(p.unitPrice)}</td>
                    <td className="table-cell"><span className={`font-mono text-xs font-semibold ${p.currentStock <= p.minStockAlert ? 'text-red-600' : 'text-emerald-600'}`}>{p.currentStock}</span></td>
                    <td className="table-cell font-mono text-xs text-surface-500">{p.minStockAlert}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/products/${p.id}`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link to={`/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-surface-500 text-sm">No products found</p>}
          </div>
        )}
      </div>
    </div>
  );
};
