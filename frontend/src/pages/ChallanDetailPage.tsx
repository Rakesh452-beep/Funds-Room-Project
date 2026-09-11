import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challanApi } from '../services';
import { formatCurrency, formatDate, getChallanStatusColor, formatError } from '../utils/helpers';
import type { Challan } from '../types';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export const ChallanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (id) loadChallan(id); }, [id]);

  const loadChallan = async (cid: string) => {
    try { setLoading(true); setChallan(await challanApi.getChallan(cid)); }
    catch { navigate('/challans'); }
    finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    if (!id) return;
    try { await challanApi.confirmChallan(id); loadChallan(id); }
    catch (e: any) { alert(formatError(e, 'Failed to confirm')); }
  };

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this challan?')) return;
    try { await challanApi.cancelChallan(id); loadChallan(id); }
    catch (e: any) { alert(formatError(e, 'Failed to cancel')); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!challan) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/challans')} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2">
          {challan.status === 'DRAFT' && (<><button onClick={handleConfirm} className="btn-primary text-sm"><CheckCircle className="w-4 h-4" /> Confirm</button><button onClick={handleCancel} className="btn-outline text-sm border-red-200 text-red-600 hover:bg-red-50"><XCircle className="w-4 h-4" /> Cancel</button></>)}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="eyebrow mb-1">Challan</p>
            <h1 className="text-2xl font-display font-bold text-surface-900 font-mono">{challan.challanNumber}</h1>
          </div>
          <span className={`badge ${getChallanStatusColor(challan.status)}`}>{challan.status}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div><p className="eyebrow text-[9px] mb-1">Customer</p><p className="text-sm font-medium text-surface-900">{challan.customer?.businessName ?? '—'}</p></div>
          <div><p className="eyebrow text-[9px] mb-1">Created</p><p className="text-sm font-mono text-surface-500">{formatDate(challan.createdAt)}</p></div>
          <div><p className="eyebrow text-[9px] mb-1">Total Quantity</p><p className="text-lg font-display font-bold text-primary">{challan.totalQuantity}</p></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-200"><h2 className="text-sm font-display font-bold text-surface-900">Items ({challan.items.length})</h2></div>
        <table className="w-full">
          <thead><tr><th className="table-header">Product</th><th className="table-header">Qty</th><th className="table-header">Unit Price</th><th className="table-header">Total</th></tr></thead>
          <tbody>
            {challan.items.map((item, i) => (
              <tr key={i} className="border-b border-surface-200">
                <td className="table-cell font-medium text-surface-900">{item.productName}</td>
                <td className="table-cell font-mono text-xs">{item.quantity}</td>
                <td className="table-cell font-mono text-xs">{formatCurrency(item.unitPrice)}</td>
                <td className="table-cell font-mono text-xs text-primary">{formatCurrency(item.unitPrice * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
