'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { Logo } from '@/components/Logo';
import { AvatarUploader } from '@/components/AvatarUploader';

type Company = { id: string; name: string; email: string; plan: string; active: boolean; _count: { users: number; cards: number } };
type User = { id: string; email: string; fullName: string; role: string; companyId: string };
type Upgrade = {
  id: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; plan: string;
  fulfillmentStatus: 'WAITING' | 'PRODUCING' | 'SHIPPED' | 'DELIVERED' | 'ACTIVATED';
  trackingCode?: string | null; carrier?: string | null;
  message?: string | null; contactPhone?: string | null; address?: string | null;
  createdAt: string; cardId?: string | null;
  company: { id: string; name: string; email: string; plan: string };
};
type Card = {
  id: string; slug: string; fullName: string; type: 'BIO_LINK' | 'DIGITAL_CARD';
  active: boolean; nfcSerial?: string | null; nfcLinkedAt?: string | null;
  company: { id: string; name: string; email: string; plan: string };
  createdAt: string;
};
type PlanProduct = {
  id: string; slug: string; name: string; description?: string | null;
  priceCents: number; currency: string; billingCycle: string;
  includesNfc: boolean; maxBioLinks: number; maxCards: number;
  features?: any; active: boolean; highlight: boolean; sortOrder: number;
};
type Stats = {
  companies: number; users: number; cards: number; bioLinks: number; digitalCards: number;
  leads: number; withNfc: number;
  upgrades: { pending: number; approved: number; rejected: number };
  fulfillment: { waiting: number; producing: number; shipped: number; delivered: number; activated: number };
  byPlan: { plan: string; count: number }[];
};

type Tab = 'dashboard' | 'kanban' | 'cards' | 'plans' | 'companies' | 'users' | 'branding';

const FULFILLMENT_COLS: { key: Upgrade['fulfillmentStatus']; label: string; color: string }[] = [
  { key: 'WAITING', label: 'Aguardando', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'PRODUCING', label: 'Em produção', color: 'bg-blue-50 border-blue-200' },
  { key: 'SHIPPED', label: 'Enviado', color: 'bg-indigo-50 border-indigo-200' },
  { key: 'DELIVERED', label: 'Recebido', color: 'bg-green-50 border-green-200' },
  { key: 'ACTIVATED', label: 'Ativado', color: 'bg-emerald-100 border-emerald-300' },
];

function brl(cents: number, currency = 'BRL') {
  try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(cents / 100); }
  catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [plans, setPlans] = useState<PlanProduct[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<Upgrade | null>(null);
  const [tracking, setTracking] = useState<Upgrade | null>(null);
  const [planEdit, setPlanEdit] = useState<PlanProduct | null>(null);
  const [nfcEdit, setNfcEdit] = useState<Card | null>(null);
  const [branding, setBranding] = useState<{ logoUrl?: string; faviconUrl?: string; ogImageUrl?: string; primaryColor?: string; brandName?: string }>({});
  const [savingBranding, setSavingBranding] = useState(false);

  const [approveForm, setApproveForm] = useState({
    fullName: '', slug: '', jobTitle: '', whatsapp: '', email: '', phone: '',
    nfcSerial: '', nfcUid: '', template: 'midnight', adminNote: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c, u, up, cd, pl] = await Promise.all([
        api('/admin/stats'),
        api('/admin/companies'),
        api('/admin/users'),
        api('/admin/upgrades'),
        api('/admin/cards'),
        api('/admin/plans'),
      ]);
      setStats(s); setCompanies(c); setUsers(u); setUpgrades(up); setCards(cd); setPlans(pl);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Sem permissão. Apenas ADMIN_MASTER pode acessar.');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    api('/admin/branding').then((b) => setBranding(b || {})).catch(() => {});
  }, []);

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSavingBranding(true);
    try {
      await api('/admin/branding', { method: 'PUT', body: JSON.stringify(branding) });
      toast.success('Branding salvo. Faça refresh para ver em todo o sistema.');
      try { localStorage.setItem('gleego_branding', JSON.stringify(branding)); } catch {}
    } catch (err) { toast.error(humanizeError(err)); }
    finally { setSavingBranding(false); }
  }

  /* ---------- Companies/Users helpers ---------- */
  const setRole = async (id: string, role: string) => {
    try { await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) }); toast.success('Papel atualizado.'); load(); }
    catch (err) { toast.error(humanizeError(err)); }
  };
  const toggleActive = async (id: string, active: boolean) => {
    try { await api(`/admin/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }); load(); }
    catch (err) { toast.error(humanizeError(err)); }
  };
  const setPlan = async (id: string, plan: string) => {
    try { await api(`/admin/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ plan }) }); load(); }
    catch (err) { toast.error(humanizeError(err)); }
  };

  /* ---------- Upgrade approval ---------- */
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
      await api(`/admin/upgrades/${approving.id}/approve`, { method: 'POST', body: JSON.stringify(approveForm) });
      toast.success('Solicitação aprovada e cartão criado!');
      setApproving(null);
      load();
    } catch (err) { toast.error(humanizeError(err)); }
    finally { setSubmitting(false); }
  }

  async function reject(u: Upgrade) {
    const note = prompt('Motivo (opcional):') ?? '';
    try {
      await api(`/admin/upgrades/${u.id}/reject`, { method: 'POST', body: JSON.stringify({ adminNote: note }) });
      toast.success('Solicitação rejeitada.');
      load();
    } catch (err) { toast.error(humanizeError(err)); }
  }

  async function setFulfillment(u: Upgrade, fulfillmentStatus: Upgrade['fulfillmentStatus']) {
    try {
      await api(`/admin/upgrades/${u.id}/fulfillment`, { method: 'PATCH', body: JSON.stringify({ fulfillmentStatus }) });
      toast.success('Status atualizado.');
      load();
    } catch (err) { toast.error(humanizeError(err)); }
  }

  /* ---------- NFC link ---------- */
  async function linkNfc(card: Card, nfcSerial: string, nfcUid: string) {
    try {
      await api(`/admin/cards/${card.id}/nfc`, { method: 'PATCH', body: JSON.stringify({ nfcSerial, nfcUid }) });
      toast.success('Tag NFC vinculada.');
      setNfcEdit(null); load();
    } catch (err) { toast.error(humanizeError(err)); }
  }
  async function unlinkNfc(card: Card) {
    if (!confirm('Desvincular tag NFC deste cartão?')) return;
    try { await api(`/admin/cards/${card.id}/nfc/unlink`, { method: 'PATCH' }); toast.success('Tag desvinculada.'); load(); }
    catch (err) { toast.error(humanizeError(err)); }
  }

  /* ---------- Plans ---------- */
  async function savePlan(p: PlanProduct, isNew: boolean) {
    try {
      const payload = { ...p, features: Array.isArray(p.features) ? p.features : String(p.features ?? '').split('\n').map(s => s.trim()).filter(Boolean) };
      if (isNew) await api('/admin/plans', { method: 'POST', body: JSON.stringify(payload) });
      else await api(`/admin/plans/${p.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      toast.success(isNew ? 'Plano criado.' : 'Plano atualizado.');
      setPlanEdit(null); load();
    } catch (err) { toast.error(humanizeError(err)); }
  }
  async function deletePlan(p: PlanProduct) {
    if (!confirm(`Excluir o plano "${p.name}"?`)) return;
    try { await api(`/admin/plans/${p.id}`, { method: 'DELETE' }); toast.success('Plano excluído.'); load(); }
    catch (err) { toast.error(humanizeError(err)); }
  }

  const pending = useMemo(() => upgrades.filter(u => u.status === 'PENDING'), [upgrades]);
  const approvedUpgrades = useMemo(() => upgrades.filter(u => u.status === 'APPROVED'), [upgrades]);

  if (loading) return <main className="p-8 text-white">Carregando…</main>;
  if (error) return <main className="p-8 text-white"><p className="text-red-400">{error}</p></main>;

  return (
    <main className="min-h-screen text-white">
      <header className="bg-[var(--ge-surface)] border-b border-white/5 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Logo size={28} href={null} />
          <span className="px-2 py-0.5 text-[10px] rounded-md font-bold bg-[var(--ge-green)] text-[#04130a]">ADMIN</span>
          <h1 className="text-base sm:text-lg font-semibold flex-1 ml-2">Painel Superadmin</h1>
          <button onClick={load} className="text-sm border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5">↻ Atualizar</button>
          <a href="/dashboard" className="text-sm ge-link hover:underline">← Voltar</a>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 -mb-px overflow-x-auto">
          {([
            ['dashboard', 'Dashboard'],
            ['kanban', `Solicitações${pending.length ? ` (${pending.length})` : ''}`],
            ['cards', `Cartões/Tags (${cards.length})`],
            ['plans', `Planos (${plans.length})`],
            ['companies', `Empresas (${companies.length})`],
            ['users', `Usuários (${users.length})`],
          ] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px whitespace-nowrap ${tab === k ? 'border-[var(--ge-green)] text-[var(--ge-green)] font-semibold' : 'border-transparent text-white/60 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* ---------- DASHBOARD ---------- */}
        {tab === 'dashboard' && stats && (
          <section className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Empresas" value={stats.companies} />
              <StatCard label="Usuários" value={stats.users} />
              <StatCard label="Cartões" value={stats.cards} />
              <StatCard label="Bio Links" value={stats.bioLinks} />
              <StatCard label="Digitais (NFC)" value={stats.digitalCards} />
              <StatCard label="Leads" value={stats.leads} />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Solicitações</h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatPill label="Pendentes" value={stats.upgrades.pending} color="bg-yellow-100 text-yellow-800" />
                  <StatPill label="Aprovadas" value={stats.upgrades.approved} color="bg-green-100 text-green-800" />
                  <StatPill label="Rejeitadas" value={stats.upgrades.rejected} color="bg-red-100 text-red-700" />
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5">
                <h3 className="font-semibold mb-3">Fulfillment (cartões NFC)</h3>
                <div className="grid grid-cols-5 gap-2">
                  <StatPill label="Aguard." value={stats.fulfillment.waiting} color="bg-yellow-100 text-yellow-800" />
                  <StatPill label="Produção" value={stats.fulfillment.producing} color="bg-blue-100 text-blue-800" />
                  <StatPill label="Enviado" value={stats.fulfillment.shipped} color="bg-indigo-100 text-indigo-700" />
                  <StatPill label="Recebido" value={stats.fulfillment.delivered} color="bg-green-100 text-green-800" />
                  <StatPill label="Ativado" value={stats.fulfillment.activated} color="bg-emerald-100 text-emerald-800" />
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5 lg:col-span-2">
                <h3 className="font-semibold mb-3">Empresas por plano</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.byPlan.map(p => (
                    <span key={p.plan} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-sm">
                      {p.plan}: <strong>{p.count}</strong>
                    </span>
                  ))}
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
                    Com NFC: <strong>{stats.withNfc}</strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- KANBAN SOLICITAÇÕES ---------- */}
        {tab === 'kanban' && (
          <section className="space-y-6">
            {/* Pendentes (aprovação) */}
            <div>
              <h2 className="font-semibold mb-3">🟡 Pendentes de aprovação ({pending.length})</h2>
              {pending.length === 0 && <p className="text-sm text-gray-500">Nenhuma solicitação pendente.</p>}
              <div className="grid sm:grid-cols-2 gap-3">
                {pending.map(u => (
                  <article key={u.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate flex-1">{u.company.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{u.plan}</span>
                    </div>
                    <p className="text-sm text-gray-500">{u.company.email}</p>
                    {u.contactPhone && <p className="text-sm">📞 {u.contactPhone}</p>}
                    {u.address && <p className="text-sm">📍 {u.address}</p>}
                    {u.message && <p className="text-sm mt-2 bg-gray-50 p-2 rounded">{u.message}</p>}
                    <p className="text-xs text-gray-400 mt-2">{new Date(u.createdAt).toLocaleString('pt-BR')}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openApprove(u)} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-sm px-3 py-2 rounded-lg">
                        Aprovar
                      </button>
                      <button onClick={() => reject(u)} className="border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg hover:bg-red-50">
                        Rejeitar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Kanban de fulfillment */}
            <div>
              <h2 className="font-semibold mb-3">📦 Fulfillment ({approvedUpgrades.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {FULFILLMENT_COLS.map(col => {
                  const items = approvedUpgrades.filter(u => u.fulfillmentStatus === col.key);
                  return (
                    <div key={col.key} className={`border rounded-xl p-3 ${col.color} min-h-[200px]`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{col.label}</h4>
                        <span className="text-xs bg-white/70 px-2 py-0.5 rounded-full">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map(u => (
                          <div key={u.id} className="bg-white rounded-lg p-2.5 text-sm shadow-sm">
                            <p className="font-semibold truncate">{u.company.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.plan}</p>
                            {u.trackingCode && (
                              <p className="text-xs mt-1">📮 {u.carrier ? `${u.carrier} ` : ''}{u.trackingCode}</p>
                            )}
                            <div className="mt-2 flex gap-1 flex-wrap">
                              <select
                                value={u.fulfillmentStatus}
                                onChange={(e) => setFulfillment(u, e.target.value as Upgrade['fulfillmentStatus'])}
                                className="text-xs border rounded px-1 py-0.5 flex-1 min-w-0"
                              >
                                {FULFILLMENT_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                              </select>
                              <button onClick={() => setTracking(u)} className="text-xs px-2 py-0.5 border rounded hover:bg-gray-50">
                                ✎
                              </button>
                            </div>
                          </div>
                        ))}
                        {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">—</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ---------- CARDS / TAGS ---------- */}
        {tab === 'cards' && (
          <section>
            <div className="overflow-x-auto bg-white border rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Empresa</th>
                  <th className="p-2">Tipo</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2">NFC Serial</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Ações</th>
                </tr></thead>
                <tbody>
                  {cards.map(c => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{c.fullName}</td>
                      <td className="p-2">{c.company.name}</td>
                      <td className="p-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'DIGITAL_CARD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                          {c.type === 'DIGITAL_CARD' ? 'NFC' : 'Bio'}
                        </span>
                      </td>
                      <td className="p-2 text-center"><a href={`https://bio.gleego.com.br/${c.slug}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">bio.gleego.com.br/{c.slug}</a></td>
                      <td className="p-2 text-center font-mono text-xs">{c.nfcSerial || <span className="text-gray-400">—</span>}</td>
                      <td className="p-2 text-center">{c.active ? '✅' : '⏸'}</td>
                      <td className="p-2 text-center">
                        {c.type === 'DIGITAL_CARD' && (
                          c.nfcSerial
                            ? <button onClick={() => unlinkNfc(c)} className="px-2 py-1 border rounded text-xs">Desvincular</button>
                            : <button onClick={() => setNfcEdit(c)} className="px-2 py-1 border rounded text-xs">Vincular tag</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {cards.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhum cartão.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------- PLANOS ---------- */}
        {tab === 'plans' && (
          <section className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => setPlanEdit({ id: '', slug: '', name: '', description: '', priceCents: 0, currency: 'BRL', billingCycle: 'monthly', includesNfc: false, maxBioLinks: 1, maxCards: 0, features: [], active: true, highlight: false, sortOrder: plans.length + 1 })}
                className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg"
              >+ Novo plano</button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map(p => (
                <article key={p.id} className={`bg-white border rounded-xl p-4 ${p.highlight ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.slug}</p>
                    </div>
                    {!p.active && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">inativo</span>}
                  </div>
                  <p className="text-2xl font-bold mt-2">{brl(p.priceCents, p.currency)}<span className="text-xs text-gray-500 font-normal"> / {p.billingCycle}</span></p>
                  {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                  <ul className="text-xs text-gray-700 mt-2 space-y-0.5">
                    <li>📇 Bio links: {p.maxBioLinks}</li>
                    <li>💳 Cartões: {p.maxCards}</li>
                    <li>{p.includesNfc ? '✅' : '❌'} Inclui NFC físico</li>
                  </ul>
                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <ul className="text-xs mt-2 space-y-0.5">{p.features.map((f: string, i: number) => <li key={i}>• {f}</li>)}</ul>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setPlanEdit(p)} className="flex-1 border rounded-lg py-1.5 text-sm hover:bg-gray-50">Editar</button>
                    <button onClick={() => deletePlan(p)} className="border border-red-200 text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50">Excluir</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ---------- COMPANIES ---------- */}
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

        {/* ---------- USERS ---------- */}
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

      {/* ---------- MODAL APROVAR ---------- */}
      {approving && (
        <Modal onClose={() => setApproving(null)} title={`Aprovar — ${approving.company.name}`}>
          <form onSubmit={approve} className="grid sm:grid-cols-2 gap-3">
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
            <div className="sm:col-span-2 border-t pt-3">
              <h3 className="font-semibold text-sm mb-2">🏷 Tag / Cartão NFC</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Número de série (impresso na tag)"
                  value={approveForm.nfcSerial} onChange={(e) => setApproveForm({ ...approveForm, nfcSerial: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="UID NFC (opcional)"
                  value={approveForm.nfcUid} onChange={(e) => setApproveForm({ ...approveForm, nfcUid: e.target.value })} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Pode aprovar sem informar agora — o vínculo pode ser feito depois na aba Cartões/Tags.</p>
            </div>
            <textarea rows={2} className="border rounded px-3 py-2 sm:col-span-2" placeholder="Nota interna (opcional)"
              value={approveForm.adminNote} onChange={(e) => setApproveForm({ ...approveForm, adminNote: e.target.value })} />
            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button type="button" onClick={() => setApproving(null)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button disabled={submitting} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg disabled:opacity-50">
                {submitting ? 'Criando…' : 'Aprovar e criar cartão NFC'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- MODAL TRACKING ---------- */}
      {tracking && <TrackingModal upgrade={tracking} onClose={() => setTracking(null)} onSave={async (payload) => {
        try { await api(`/admin/upgrades/${tracking.id}/fulfillment`, { method: 'PATCH', body: JSON.stringify(payload) }); toast.success('Atualizado.'); setTracking(null); load(); }
        catch (err) { toast.error(humanizeError(err)); }
      }} />}

      {/* ---------- MODAL NFC ---------- */}
      {nfcEdit && <NfcModal card={nfcEdit} onClose={() => setNfcEdit(null)} onSave={(s, u) => linkNfc(nfcEdit, s, u)} />}

      {/* ---------- MODAL PLAN ---------- */}
      {planEdit && <PlanModal plan={planEdit} onClose={() => setPlanEdit(null)} onSave={(p) => savePlan(p, !planEdit.id)} />}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TrackingModal({ upgrade, onClose, onSave }: { upgrade: Upgrade; onClose: () => void; onSave: (p: any) => void }) {
  const [carrier, setCarrier] = useState(upgrade.carrier ?? '');
  const [trackingCode, setTrackingCode] = useState(upgrade.trackingCode ?? '');
  const [adminNote, setAdminNote] = useState('');
  return (
    <Modal title={`Rastreio — ${upgrade.company.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Transportadora (ex: Correios)" value={carrier} onChange={e => setCarrier(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Código de rastreio" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} />
        </div>
        <textarea rows={2} className="border rounded px-3 py-2 w-full" placeholder="Nota interna" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
        <button onClick={() => onSave({ carrier, trackingCode, adminNote })} className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg">Salvar</button>
      </div>
    </Modal>
  );
}

function NfcModal({ card, onClose, onSave }: { card: Card; onClose: () => void; onSave: (serial: string, uid: string) => void }) {
  const [serial, setSerial] = useState('');
  const [uid, setUid] = useState('');
  return (
    <Modal title={`Vincular tag — ${card.fullName}`} onClose={onClose}>
      <div className="space-y-3">
        <input required className="border rounded px-3 py-2 w-full" placeholder="Número de série (impresso na tag) *" value={serial} onChange={e => setSerial(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" placeholder="UID NFC (opcional)" value={uid} onChange={e => setUid(e.target.value)} />
        <button onClick={() => onSave(serial, uid)} disabled={!serial.trim()} className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg disabled:opacity-50">Vincular</button>
      </div>
    </Modal>
  );
}

function PlanModal({ plan, onClose, onSave }: { plan: PlanProduct; onClose: () => void; onSave: (p: PlanProduct) => void }) {
  const [p, setP] = useState<PlanProduct>({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features.join('\n') as any : (plan.features ?? ''),
  });
  const upd = <K extends keyof PlanProduct>(k: K, v: PlanProduct[K]) => setP({ ...p, [k]: v });
  return (
    <Modal title={plan.id ? `Editar — ${plan.name}` : 'Novo plano'} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        <input required className="border rounded px-3 py-2" placeholder="Nome *" value={p.name} onChange={e => upd('name', e.target.value)} />
        <input required className="border rounded px-3 py-2" placeholder="Slug *" value={p.slug} onChange={e => upd('slug', e.target.value)} />
        <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Descrição" value={p.description ?? ''} onChange={e => upd('description', e.target.value)} />
        <label className="text-sm">Preço (centavos)
          <input type="number" min={0} className="border rounded px-3 py-2 w-full" value={p.priceCents} onChange={e => upd('priceCents', parseInt(e.target.value || '0'))} />
        </label>
        <label className="text-sm">Moeda
          <input className="border rounded px-3 py-2 w-full" value={p.currency} onChange={e => upd('currency', e.target.value)} />
        </label>
        <label className="text-sm">Cobrança
          <select className="border rounded px-3 py-2 w-full" value={p.billingCycle} onChange={e => upd('billingCycle', e.target.value)}>
            <option value="monthly">Mensal</option><option value="yearly">Anual</option><option value="one_time">Único</option>
          </select>
        </label>
        <label className="text-sm">Ordem
          <input type="number" className="border rounded px-3 py-2 w-full" value={p.sortOrder} onChange={e => upd('sortOrder', parseInt(e.target.value || '0'))} />
        </label>
        <label className="text-sm">Máx Bio Links
          <input type="number" min={0} className="border rounded px-3 py-2 w-full" value={p.maxBioLinks} onChange={e => upd('maxBioLinks', parseInt(e.target.value || '0'))} />
        </label>
        <label className="text-sm">Máx Cartões NFC
          <input type="number" min={0} className="border rounded px-3 py-2 w-full" value={p.maxCards} onChange={e => upd('maxCards', parseInt(e.target.value || '0'))} />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.includesNfc} onChange={e => upd('includesNfc', e.target.checked)} /> Inclui tag NFC física</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.active} onChange={e => upd('active', e.target.checked)} /> Ativo</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.highlight} onChange={e => upd('highlight', e.target.checked)} /> Destacar</label>
        <label className="text-sm sm:col-span-2">Features (1 por linha)
          <textarea rows={4} className="border rounded px-3 py-2 w-full" value={p.features as any ?? ''} onChange={e => upd('features', e.target.value as any)} />
        </label>
        <div className="sm:col-span-2 flex gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
          <button onClick={() => onSave(p)} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg">Salvar</button>
        </div>
      </div>
    </Modal>
  );
}