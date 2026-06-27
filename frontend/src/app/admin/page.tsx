'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Company = { id: string; name: string; email: string; plan: string; active: boolean; _count: { users: number; cards: number } };
type User = { id: string; email: string; fullName: string; role: string; companyId: string };
type Upgrade = {
  id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; plan: string;
  message?: string; contactPhone?: string; address?: string; createdAt: string; cardId?: string;
  company: { id: string; name: string; email: string; plan: string };
};

type Tab = 'upgrades' | 'companies' | 'users';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('upgrades');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Upgrade | null>(null);
  const [approveForm, setApproveForm] = useState({
    fullName: '', slug: '', jobTitle: '', whatsapp: '', email: '', phone: '',
    nfcSerial: '', nfcUid: '', template: 'midnight', adminNote: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, u, up] = await Promise.all([
        api('/admin/companies'), api('/admin/users'), api('/admin/upgrades'),
      ]);
      setCompanies(c); setUsers(u); setUpgrades(up); setError('');
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

  function openApprove(u: Upgrade) {
    setApproving(u);
    const baseSlug = u.company.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 32);
    setApproveForm({
      fullName: u.company.name, slug: baseSlug, jobTitle: '', whatsapp: u.contactPhone ?? '',
      email: u.company.email, phone: '', nfcSerial: '', nfcUid: '', template: 'midnight', adminNote: '',
    });
  }

  async function approve(e: React.FormEvent) {
    e.preventDefault();
    if (!approving) return;
    setSubmitting(true);
    try {
      await api(`/admin/upgrades/${approving.id}/approve`, {
        method: 'POST', body: JSON.stringify(approveForm),
      });
      toast.success('Solicitação aprovada e cartão NFC criado!');
      setApproving(null);
      load();
    } catch (err) {
      toast.error(humanizeError(err));
    } finally { setSubmitting(false); }
  }

  async function reject(u: Upgrade) {
    const note = prompt('Motivo (opcional):') ?? '';
    try {
      await api(`/admin/upgrades/${u.id}/reject`, { method: 'POST', body: JSON.stringify({ adminNote: note }) });
      toast.success('Solicitação rejeitada.');
      load();
    } catch (err) { toast.error(humanizeError(err)); }
  }

  if (loading) return <main className="p-8">Carregando...</main>;
  if (error) return <main className="p-8"><p className="text-red-600">{error}</p></main>;

  const pending = upgrades.filter(u => u.status === 'PENDING');

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold flex-1">Painel Superadmin</h1>
          <a href="/dashboard" className="text-sm text-blue-700 hover:underline">← Voltar</a>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 -mb-px overflow-x-auto">
          {([
            ['upgrades', `Solicitações${pending.length ? ` (${pending.length})` : ''}`],
            ['companies', `Empresas (${companies.length})`],
            ['users', `Usuários (${users.length})`],
          ] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px whitespace-nowrap ${tab === k ? 'border-blue-700 text-blue-700 font-semibold' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        {tab === 'upgrades' && (
          <section className="space-y-3">
            {upgrades.length === 0 && <p className="text-gray-500">Nenhuma solicitação ainda.</p>}
            {upgrades.map(u => (
              <article key={u.id} className="bg-white border rounded-xl p-4 sm:p-5">
                <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{u.company.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        u.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-700'
                      }`}>{u.status}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.plan}</span>
                    </div>
                    <p className="text-sm text-gray-500">{u.company.email}</p>
                    {u.contactPhone && <p className="text-sm">📞 {u.contactPhone}</p>}
                    {u.address && <p className="text-sm">📍 {u.address}</p>}
                    {u.message && <p className="text-sm mt-2 bg-gray-50 p-2 rounded">{u.message}</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(u.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  {u.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => openApprove(u)} className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-3 py-2 rounded-lg">
                        Aprovar e criar cartão
                      </button>
                      <button onClick={() => reject(u)} className="border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg hover:bg-red-50">
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === 'companies' && (
          <div className="overflow-x-auto bg-white border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="p-2 text-left">Nome</th><th className="p-2 text-left">Email</th>
                <th className="p-2">Plano</th><th className="p-2">Users</th><th className="p-2">Cartões</th>
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
        )}

        {tab === 'users' && (
          <div className="overflow-x-auto bg-white border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="p-2 text-left">Nome</th><th className="p-2 text-left">Email</th><th className="p-2">Papel</th>
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
        )}
      </div>

      {/* Modal Aprovar */}
      {approving && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50" onClick={() => setApproving(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={approve}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 flex items-center justify-between">
              <h2 className="font-semibold">Aprovar — {approving.company.name}</h2>
              <button type="button" onClick={() => setApproving(null)} className="text-gray-500">×</button>
            </div>
            <p className="sm:col-span-2 text-xs text-gray-500">
              Será criado um cartão DIGITAL_CARD vinculado ao número de série da tag NFC. O plano da empresa será atualizado para <strong>{approving.plan}</strong>.
            </p>

            <input required className="border rounded px-3 py-2" placeholder="Nome no cartão *"
              value={approveForm.fullName} onChange={(e) => setApproveForm({ ...approveForm, fullName: e.target.value })} />
            <input required className="border rounded px-3 py-2" placeholder="Slug (URL pública) *"
              value={approveForm.slug} onChange={(e) => setApproveForm({ ...approveForm, slug: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Cargo"
              value={approveForm.jobTitle} onChange={(e) => setApproveForm({ ...approveForm, jobTitle: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="WhatsApp"
              value={approveForm.whatsapp} onChange={(e) => setApproveForm({ ...approveForm, whatsapp: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Email"
              value={approveForm.email} onChange={(e) => setApproveForm({ ...approveForm, email: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Telefone"
              value={approveForm.phone} onChange={(e) => setApproveForm({ ...approveForm, phone: e.target.value })} />

            <div className="sm:col-span-2 border-t pt-3 mt-1">
              <h3 className="font-semibold text-sm mb-2">🏷 Tag / Cartão NFC</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Número de série (impresso na tag)"
                  value={approveForm.nfcSerial} onChange={(e) => setApproveForm({ ...approveForm, nfcSerial: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="UID NFC (opcional)"
                  value={approveForm.nfcUid} onChange={(e) => setApproveForm({ ...approveForm, nfcUid: e.target.value })} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Pode aprovar sem informar agora — o vínculo pode ser feito depois na lista de cartões.</p>
            </div>

            <textarea rows={2} className="border rounded px-3 py-2 sm:col-span-2" placeholder="Nota interna (opcional)"
              value={approveForm.adminNote} onChange={(e) => setApproveForm({ ...approveForm, adminNote: e.target.value })} />

            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button type="button" onClick={() => setApproving(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button disabled={submitting} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg disabled:opacity-50">
                {submitting ? 'Criando...' : 'Aprovar e criar cartão NFC'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}