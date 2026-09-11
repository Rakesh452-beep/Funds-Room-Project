import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { challanApi } from '../services';
import { useAuth } from '../context/AuthContext';
import { formatDate, getChallanStatusColor, formatError } from '../utils/helpers';
import type { Challan } from '../types';
import { Plus, Search, Eye, FileDown } from 'lucide-react';

export const ChallanListPage = () => {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SALES';
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadChallans(); }, []);

  const loadChallans = async () => {
    try { setLoading(true); setChallans(await challanApi.getChallans()); }
    catch (e: any) { setError(formatError(e, 'Failed to load challans')); }
    finally { setLoading(false); }
  };

  const filtered = challans.filter((ch) =>
    ch.challanNumber.toLowerCase().includes(search.toLowerCase()) ||
    ch.customer?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    false
  );

  const handleDownloadPdf = async (id: string, number: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const blob = await challanApi.downloadInvoice(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${number}-invoice.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) { alert(formatError(err, 'Failed to download invoice')); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><div className="eyebrow mb-1">Sales</div><h1 className="text-2xl font-display font-bold text-surface-900">Challans</h1></div>
        {canCreate && <Link to="/challans/new" className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Challan</Link>}
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input className="input !pl-9" placeholder="Search by number or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><th className="table-header">Number</th><th className="table-header">Customer</th><th className="table-header">Date</th><th className="table-header">Qty</th><th className="table-header">Status</th><th className="table-header">Actions</th></tr></thead>
              <tbody>
                {filtered.map((ch) => (
                  <tr key={ch.id} className="border-b border-surface-200 hover:bg-surface-100 transition-colors">
                    <td className="table-cell"><Link to={`/challans/${ch.id}`} className="text-surface-900 hover:text-primary font-mono font-medium text-xs transition-colors">{ch.challanNumber}</Link></td>
                    <td className="table-cell">{ch.customer?.businessName ?? '—'}</td>
                    <td className="table-cell font-mono text-xs">{formatDate(ch.createdAt)}</td>
                    <td className="table-cell font-mono text-xs">{ch.totalQuantity}</td>
                    <td className="table-cell"><span className={`badge ${getChallanStatusColor(ch.status)}`}>{ch.status}</span></td>
                    <td className="table-cell"><div className="flex items-center gap-1">
                      <Link to={`/challans/${ch.id}`} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors inline-flex" title="View"><Eye className="w-3.5 h-3.5" /></Link>
                      <button onClick={(e) => handleDownloadPdf(ch.id, ch.challanNumber, e)} className="p-1.5 rounded-lg hover:bg-lime-50 text-surface-500 hover:text-lime-900 transition-colors inline-flex" title="Download invoice PDF"><FileDown className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-surface-500 text-sm">No challans found</p>}
          </div>
        )}
      </div>
    </div>
  );
};
