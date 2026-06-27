'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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
      .then((data) => {
        setCards(data);
        setError('');
      })
      .catch(() => setError('Sessão expirada. Faça login novamente.'))
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
        body: JSON.stringify({ ...form, slug }),
      });
      setForm({ fullName: '', slug: '', jobTitle: '', phone: '', whatsapp: '', email: '', website: '', bio: '' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar cartão');
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
    } catch (err: any) {
      setError(err?.message || 'Erro');
    }
  }

  async function removeCard(card: Card) {
    if (!confirm(`Excluir o cartão de ${card.fullName}?`)) return;
    try {
      await api(`/cards/${card.id}`, { method: 'DELETE' });
      load();
    } catch (err: any) {
      setError(err?.message || 'Erro');
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Glee-go ID</h1>
            <p className="text-xs text-gray-500">{user.email} · {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'ADMIN_MASTER' && (
              <a href="/admin" className="px-3 py-2 text-sm rounded border hover:bg-gray-100">
                Admin
              </a>
            )}
            <button onClick={logout} className="px-3 py-2 text-sm rounded border hover:bg-gray-100">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Meus cartões</h2>
            <p className="text-sm text-gray-500">{cards.length} cartão(ões)</p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-black text-white px-4 py-2 rounded text-sm"
          >
            {showForm ? 'Cancelar' : '+ Novo cartão'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={createCard} className="bg-white border rounded-xl p-6 mb-6 grid md:grid-cols-2 gap-3">
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
            <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Website"
              value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Bio" rows={3}
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <button disabled={creating} className="md:col-span-2 bg-black text-white py-2 rounded disabled:opacity-50">
              {creating ? 'Criando...' : 'Criar cartão'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : cards.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center">
            <p className="text-gray-600 mb-4">Você ainda não tem cartões.</p>
            <button onClick={() => setShowForm(true)} className="bg-black text-white px-4 py-2 rounded">
              Criar meu primeiro cartão
            </button>
          </div>
        ) : (
          <ul className="grid md:grid-cols-2 gap-4">
            {cards.map((c) => (
              <li key={c.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{c.fullName}</h3>
                    {c.jobTitle && <p className="text-sm text-gray-500">{c.jobTitle}</p>}
                    <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer"
                       className="text-xs text-blue-600 hover:underline">/c/{c.slug}</a>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.active ? 'ativo' : 'inativo'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
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