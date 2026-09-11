import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services';
import { formatDate, getStatusColor, formatError } from '../utils/helpers';
import type { Customer } from '../types';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';

export const CustomerListPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (e: any) { setError(formatError(e, 'Failed to load customers')); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await customerApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (e: any) { alert(formatError(e, 'Delete failed')); }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Operations</div>
          <h1 className="text-2xl font-display font-bold text-surface-900">Customers</h1>
        </div>
        <Link to="/customers/new" className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Customer</Link>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input !pl-9" placeholder="Search by name or business…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-header">Name</th><th className="table-header">Business</th><th className="table-header">Mobile</th><th className="table-header">Status</th><th className="table-header">Created</th><th className="table-header">Actions</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-surface-200 hover:bg-surface-100 transition-colors">
                    <td className="table-cell"><Link to={`/customers/${c.id}`} className="text-surface-900 hover:text-primary font-medium transition-colors">{c.name}</Link></td>
                    <td className="table-cell">{c.businessName}</td>
                    <td className="table-cell font-mono text-xs">{c.mobile}</td>
                    <td className="table-cell"><span className={`badge ${getStatusColor(c.status)}`}>{c.status}</span></td>
                    <td className="table-cell font-mono text-xs">{formatDate(c.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/customers/${c.id}`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link to={`/customers/${c.id}/edit`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-surface-500 text-sm">No customers found</p>}
          </div>
        )}
      </div>
    </div>
  );
};
