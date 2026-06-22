'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Company = { id: string; name: string; email: string; plan: string; active: boolean; _count: { users: number; cards: number } };
type User = { id: string; email: string; fullName: string; role: string; companyId: string };

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, u] = await Promise.all([api('/admin/companies'), api('/admin/users')]);
      setCompanies(c); setUsers(u); setError('');
    } catch (e: any) {
      setError(e?.message || 'Sem permissão. Apenas ADMIN_MASTER pode acessar.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setRole = async (id: string, role: string) => {
    await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
    load();
  };
  const toggleActive = async (id: string, active: boolean) => {
    await api(`/admin/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
    load();
  };
  const setPlan = async (id: string, plan: string) => {
    await api(`/admin/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ plan }) });
    load();
  };

  if (loading) return <main className="p-8">Carregando...</main>;
  if (error) return <main className="p-8"><p className="text-red-600">{error}</p></main>;

  return (
    <main className="min-h-screen p-8 space-y-10">
      <h1 className="text-3xl font-bold">Painel Superadmin</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">Empresas ({companies.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50"><tr>
              <th className="p-2 text-left">Nome</th><th className="p-2 text-left">Email</th>
              <th className="p-2">Plano</th><th className="p-2">Usuários</th><th className="p-2">Cartões</th>
              <th className="p-2">Ativa</th><th className="p-2">Ações</th>
            </tr></thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2 text-center">
                    <select value={c.plan} onChange={e => setPlan(c.id, e.target.value)} className="border rounded px-1">
                      <option>FREE</option><option>PRO</option><option>BUSINESS</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">{c._count.users}</td>
                  <td className="p-2 text-center">{c._count.cards}</td>
                  <td className="p-2 text-center">{c.active ? 'Sim' : 'Não'}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => toggleActive(c.id, !c.active)} className="px-2 py-1 border rounded">
                      {c.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Usuários ({users.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-50"><tr>
              <th className="p-2 text-left">Nome</th><th className="p-2 text-left">Email</th>
              <th className="p-2">Papel</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 text-center">
                    <select value={u.role} onChange={e => setRole(u.id, e.target.value)} className="border rounded px-1">
                      <option>ADMIN_MASTER</option><option>ADMIN_COMPANY</option><option>MEMBER</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}