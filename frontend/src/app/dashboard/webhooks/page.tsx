'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Logo } from '@/components/Logo';

type Hook = {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  cardSlug?: string | null;
  lastStatus?: number | null;
  lastError?: string | null;
  lastFiredAt?: string | null;
  successCount: number;
  failureCount: number;
};

const ALL_EVENTS = [
  { id: 'lead.created', label: 'Lead capturado' },
  { id: 'card.viewed', label: 'Cartão visualizado' },
  { id: 'card.activated', label: 'Cartão ativado' },
];

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: 'Integração WhatsApp Gleego',
    url: 'https://whats.gleego.com.br/api/webhooks/gleego-id',
    events: ['lead.created'] as string[],
    cardSlug: '',
  });

  async function load() {
    setLoading(true);
    try {
      const data = await api('/webhooks');
      setHooks(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.url) return toast.error('Informe a URL');
    setCreating(true);
    try {
      await api('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name, url: form.url, events: form.events,
          cardSlug: form.cardSlug || null,
        }),
      });
      toast.success('Webhook criado');
      setForm({ ...form, cardSlug: '' });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao criar');
    } finally { setCreating(false); }
  }

  async function toggle(h: Hook) {
    await api(`/webhooks/${h.id}`, { method: 'PATCH', body: JSON.stringify({ active: !h.active }) });
    load();
  }
  async function test(h: Hook) {
    const t = toast.loading('Enviando teste...');
    try {
      const r: any = await api(`/webhooks/${h.id}/test`, { method: 'POST' });
      toast.dismiss(t);
      if (r?.ok) toast.success(`OK (${r.status})`); else toast.error(r?.error || `Erro ${r?.status}`);
      load();
    } catch (e: any) { toast.dismiss(t); toast.error(e?.message); }
  }
  async function rotate(h: Hook) {
    if (!confirm('Gerar um novo secret? O anterior deixa de funcionar.')) return;
    await api(`/webhooks/${h.id}/rotate`, { method: 'POST' });
    toast.success('Secret renovado'); load();
  }
  async function remove(h: Hook) {
    if (!confirm(`Excluir webhook "${h.name}"?`)) return;
    await api(`/webhooks/${h.id}`, { method: 'DELETE' });
    toast.success('Excluído'); load();
  }
  function copy(v: string) {
    navigator.clipboard?.writeText(v); toast.success('Copiado');
  }

  return (
    <main className="min-h-screen text-white">
      <header className="bg-[var(--ge-surface)] border-b border-white/5 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={28} href="/dashboard" />
            <span className="text-sm text-white/60 border-l border-white/10 pl-3">Webhooks</span>
          </div>
          <Link href="/dashboard" className="text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5">← Dashboard</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <section className="ge-card p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-white/60 mt-1">
            Envie cada novo lead automaticamente para outra plataforma (ex.:{' '}
            <b className="text-[var(--ge-green)]">whats.gleego.com.br</b>) com assinatura HMAC para validação.
          </p>
        </section>

        {/* New webhook form */}
        <section className="ge-card p-5 sm:p-6">
          <h2 className="font-semibold mb-3">Novo webhook</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="text-white/60">Nome</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 rounded-xl bg-[var(--ge-surface-2)] border border-white/10 px-3 py-2 outline-none focus:border-white/30" />
            </label>
            <label className="text-sm">
              <span className="text-white/60">Slug específico (opcional)</span>
              <input value={form.cardSlug} onChange={(e) => setForm({ ...form, cardSlug: e.target.value })}
                placeholder="ex.: thiago2 — vazio = todos os cartões"
                className="w-full mt-1 rounded-xl bg-[var(--ge-surface-2)] border border-white/10 px-3 py-2 outline-none focus:border-white/30" />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="text-white/60">URL do destino (HTTPS)</span>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full mt-1 rounded-xl bg-[var(--ge-surface-2)] border border-white/10 px-3 py-2 outline-none focus:border-white/30" />
            </label>
            <div className="sm:col-span-2">
              <span className="text-white/60 text-sm">Eventos</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {ALL_EVENTS.map((e) => {
                  const on = form.events.includes(e.id);
                  return (
                    <button key={e.id} type="button"
                      onClick={() => setForm({ ...form, events: on ? form.events.filter((x) => x !== e.id) : [...form.events, e.id] })}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        on ? 'bg-[var(--ge-green)]/15 border-[var(--ge-green)]/40 text-[var(--ge-green)]'
                           : 'border-white/10 text-white/70 hover:bg-white/5'
                      }`}>
                      {on ? '✓ ' : ''}{e.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={create} disabled={creating} className="ge-btn px-5 py-2 text-sm disabled:opacity-50">
              {creating ? 'Criando...' : '+ Criar webhook'}
            </button>
          </div>
        </section>

        {/* List */}
        <section className="space-y-3">
          {loading ? (
            <p className="text-white/50 text-sm">Carregando...</p>
          ) : hooks.length === 0 ? (
            <p className="text-white/50 text-sm">Nenhum webhook configurado ainda.</p>
          ) : hooks.map((h) => (
            <article key={h.id} className="ge-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{h.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      h.active ? 'bg-[var(--ge-green)]/10 border-[var(--ge-green)]/30 text-[var(--ge-green)]'
                               : 'bg-white/5 border-white/10 text-white/50'
                    }`}>{h.active ? 'Ativo' : 'Pausado'}</span>
                    {h.cardSlug && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/60">slug: {h.cardSlug}</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-1 break-all">{h.url}</p>
                  <p className="text-xs text-white/40 mt-1">
                    Eventos: {h.events.join(', ') || '—'} ·
                    {' '}entregas OK: <b className="text-[var(--ge-green)]">{h.successCount}</b> ·
                    {' '}falhas: <b className="text-red-400">{h.failureCount}</b>
                    {h.lastFiredAt && <> · último: {new Date(h.lastFiredAt).toLocaleString('pt-BR')}{h.lastStatus ? ` (HTTP ${h.lastStatus})` : ''}</>}
                    {h.lastError && <span className="text-red-400"> · {h.lastError}</span>}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => test(h)} className="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:bg-white/5">Testar</button>
                  <button onClick={() => toggle(h)} className="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:bg-white/5">
                    {h.active ? 'Pausar' : 'Ativar'}
                  </button>
                  <button onClick={() => rotate(h)} className="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:bg-white/5">Renovar secret</button>
                  <button onClick={() => remove(h)} className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10">Excluir</button>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-[auto_1fr_auto] gap-2 items-center text-xs bg-[var(--ge-surface-2)] border border-white/10 rounded-xl p-3">
                <span className="text-white/50">Secret</span>
                <code className="font-mono text-[11px] break-all text-white/80">{h.secret}</code>
                <button onClick={() => copy(h.secret)} className="px-2 py-1 rounded-md border border-white/10 hover:bg-white/5">Copiar</button>
              </div>
            </article>
          ))}
        </section>

        {/* Docs */}
        <section className="ge-card p-5 sm:p-6 text-sm">
          <h2 className="font-semibold mb-2">Como o destino valida a requisição</h2>
          <p className="text-white/70">Cada POST inclui os headers:</p>
          <pre className="mt-2 bg-black/40 border border-white/10 rounded-xl p-3 overflow-x-auto text-xs"><code>{`X-Gleego-Event:     lead.created
X-Gleego-Timestamp: 1735689600
X-Gleego-Signature: t=1735689600,v1=<hmac_sha256(secret, "TIMESTAMP.BODY")>`}</code></pre>
          <p className="text-white/70 mt-3">Exemplo de payload:</p>
          <pre className="mt-2 bg-black/40 border border-white/10 rounded-xl p-3 overflow-x-auto text-xs"><code>{`{
  "id": "evt_xxx",
  "event": "lead.created",
  "created_at": "2025-01-01T12:00:00.000Z",
  "data": {
    "lead": { "name": "Fulano", "phone": "+55119...", "email": "...", "message": "..." },
    "card": { "slug": "thiago2", "name": "Thiago" }
  }
}`}</code></pre>
        </section>
      </div>
    </main>
  );
}