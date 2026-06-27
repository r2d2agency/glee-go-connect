'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

type Card = {
  id: string;
  slug: string;
  fullName: string;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  active: boolean;
};

function parseJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<{ email?: string; role?: string }>({});
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgrade, setUpgrade] = useState({ plan: 'PRO', message: '', contactPhone: '', address: '' });
  const [upgradeSending, setUpgradeSending] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: '',
    slug: '',
    jobTitle: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    bio: '',
  });

  function load() {
    setLoading(true);
    api('/cards')
      .then((data) => { setCards(data); setError(''); })
      .catch((err) => {
        const msg = humanizeError(err, 'Não foi possível carregar seus cartões.');
        setError(msg);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gleego_token') : null;
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setUser(parseJwt(token));
    load();
    api('/upgrades/mine').then(setMyRequests).catch(() => {});
    api('/plans').then((p) => setPlans(p || [])).catch(() => {});
  }, [router]);

  function logout() {
    localStorage.removeItem('gleego_token');
    router.push('/auth/login');
  }

  async function createCard(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const slug =
        form.slug.trim() ||
        form.fullName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      await api('/cards', {
        method: 'POST',
        body: JSON.stringify({ ...form, slug, type: 'BIO_LINK' }),
      });
      setForm({ fullName: '', slug: '', jobTitle: '', phone: '', whatsapp: '', email: '', website: '', bio: '' });
      setShowForm(false);
      toast.success('Cartão criado!');
      load();
    } catch (err) {
      toast.error(humanizeError(err, 'Erro ao criar cartão.'));
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(card: Card) {
    try {
      await api(`/cards/${card.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !card.active }),
      });
      load();
    } catch (err) {
      toast.error(humanizeError(err));
    }
  }

  async function removeCard(card: Card) {
    if (!confirm(`Excluir o cartão de ${card.fullName}?`)) return;
    try {
      await api(`/cards/${card.id}`, { method: 'DELETE' });
      toast.success('Cartão removido.');
      load();
    } catch (err) {
      toast.error(humanizeError(err));
    }
  }

  async function requestUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setUpgradeSending(true);
    try {
      await api('/upgrades', { method: 'POST', body: JSON.stringify(upgrade) });
      toast.success('Solicitação enviada! Nossa equipe entrará em contato.');
      setShowUpgrade(false);
      setUpgrade({ plan: 'PRO', message: '', contactPhone: '', address: '' });
      api('/upgrades/mine').then(setMyRequests).catch(() => {});
    } catch (err) {
      toast.error(humanizeError(err));
    } finally {
      setUpgradeSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">Glee-go ID</h1>
            <p className="text-xs text-gray-500 truncate">{user.email} · {user.role}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user.role === 'ADMIN_MASTER' && (
              <a href="/admin" className="px-3 py-1.5 sm:py-2 text-sm rounded border hover:bg-gray-100">
                Admin
              </a>
            )}
            <button onClick={logout} className="px-3 py-1.5 sm:py-2 text-sm rounded border hover:bg-gray-100">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Upgrade callout */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-xl p-4 sm:p-5 mb-6 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <h3 className="font-semibold">Quer um cartão ou tag NFC físico?</h3>
            <p className="text-sm opacity-90">Solicite seu upgrade — nossa equipe produz, ativa e envia o NFC vinculado à sua conta.</p>
            {myRequests[0] && (
              <p className="text-xs opacity-90 mt-2">
                Última solicitação: <strong>{myRequests[0].status}</strong> ({myRequests[0].plan})
              </p>
            )}
          </div>
          <button onClick={() => setShowUpgrade(true)} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm shrink-0">
            Solicitar cartão NFC
          </button>
        </div>

        {showUpgrade && (
          <form onSubmit={requestUpgrade} className="bg-white border rounded-xl p-4 sm:p-6 mb-6 grid sm:grid-cols-2 gap-3">
            <h3 className="sm:col-span-2 font-semibold">Solicitar cartão/tag NFC</h3>
            <label className="text-sm sm:col-span-2">Plano desejado
              <select className="mt-1 w-full border rounded px-3 py-2" value={upgrade.plan}
                onChange={(e) => setUpgrade({ ...upgrade, plan: e.target.value })}>
                {plans.filter((p: any) => p.includesNfc).map((p: any) => (
                  <option key={p.id} value={p.slug.toUpperCase()}>
                    {p.name} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: p.currency || 'BRL' }).format(p.priceCents / 100)}/{p.billingCycle}
                  </option>
                ))}
                {plans.filter((p: any) => p.includesNfc).length === 0 && (
                  <>
                    <option value="PRO">PRO — Cartão NFC</option>
                    <option value="BUSINESS">BUSINESS — Cartão + Tag + Avançado</option>
                  </>
                )}
              </select>
            </label>
            <input className="border rounded px-3 py-2" placeholder="Telefone de contato"
              value={upgrade.contactPhone} onChange={(e) => setUpgrade({ ...upgrade, contactPhone: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Endereço de entrega"
              value={upgrade.address} onChange={(e) => setUpgrade({ ...upgrade, address: e.target.value })} />
            <textarea rows={3} className="border rounded px-3 py-2 sm:col-span-2"
              placeholder="Mensagem para nossa equipe (opcional)"
              value={upgrade.message} onChange={(e) => setUpgrade({ ...upgrade, message: e.target.value })} />
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" onClick={() => setShowUpgrade(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
              <button disabled={upgradeSending} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg disabled:opacity-50">
                {upgradeSending ? 'Enviando...' : 'Enviar solicitação'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold">Meus cartões</h2>
            <p className="text-sm text-gray-500">{cards.length} cartão(ões)</p>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className="bg-blue-700 hover:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm shrink-0">
            {showForm ? 'Cancelar' : '+ Novo'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={createCard} className="bg-white border rounded-xl p-4 sm:p-6 mb-6 grid sm:grid-cols-2 gap-3">
            <input required className="border rounded px-3 py-2" placeholder="Nome completo *"
              value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Slug (URL) — opcional"
              value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Cargo"
              value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Telefone"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="WhatsApp"
              value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            <input className="border rounded px-3 py-2" placeholder="Email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Website"
              value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <textarea className="border rounded px-3 py-2 sm:col-span-2" placeholder="Bio" rows={3}
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <button disabled={creating} className="sm:col-span-2 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-lg disabled:opacity-50">
              {creating ? 'Criando...' : 'Criar cartão'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : cards.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 sm:p-12 text-center">
            <p className="text-gray-600 mb-4">Você ainda não tem cartões.</p>
            <button onClick={() => setShowForm(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg">
              Criar meu primeiro cartão
            </button>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <li key={c.id} className="bg-white border rounded-xl p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{c.fullName}</h3>
                    {c.jobTitle && <p className="text-sm text-gray-500">{c.jobTitle}</p>}
                    <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer"
                       className="text-xs text-blue-600 hover:underline truncate block">/c/{c.slug}</a>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.active ? 'ativo' : 'inativo'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <a href={`/dashboard/cards/${c.id}`} className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded">
                    Editar
                  </a>
                  <button onClick={() => toggleActive(c)} className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50">
                    {c.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => removeCard(c)} className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}