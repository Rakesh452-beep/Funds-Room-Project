import { useEffect, useState } from 'react';
import { userApi } from '../services';
import { formatDate, getRoleColor, formatError } from '../utils/helpers';
import type { User } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES' as User['role'] });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try { setLoading(true); setUsers(await userApi.getUsers()); }
    catch (e: any) { setError(formatError(e, 'Failed to load users')); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await userApi.createUser(form); setShowForm(false); setForm({ name: '', email: '', password: '', role: 'SALES' }); loadUsers(); }
    catch (e: any) { alert(formatError(e, 'Failed to create user')); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await userApi.deleteUser(id); setUsers((prev) => prev.filter((u) => u.id !== id)); }
    catch (e: any) { alert(formatError(e, 'Delete failed')); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><div className="eyebrow mb-1">System</div><h1 className="text-2xl font-display font-bold text-surface-900">User Management</h1></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New User'}</button>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-lg">
          <div><label className="eyebrow block mb-1.5">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div><label className="eyebrow block mb-1.5">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="eyebrow block mb-1.5">Password</label><input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div>
            <label className="eyebrow block mb-1.5">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}>
              <option value="ADMIN">Admin</option>
              <option value="SALES">Sales</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="ACCOUNTS">Accounts</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Create User</button>
        </form>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr><th className="table-header">Name</th><th className="table-header">Email</th><th className="table-header">Role</th><th className="table-header">Created</th><th className="table-header">Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-surface-200 hover:bg-surface-100 transition-colors">
                  <td className="table-cell font-medium text-surface-900">{u.name}</td>
                  <td className="table-cell font-mono text-xs">{u.email}</td>
                  <td className="table-cell"><span className={`badge ${getRoleColor(u.role)}`}>{u.role}</span></td>
                  <td className="table-cell font-mono text-xs">{formatDate(u.createdAt)}</td>
                  <td className="table-cell">
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};
