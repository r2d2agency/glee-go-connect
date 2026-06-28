'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Logo from '@/components/Logo';

const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

type Lead = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  createdAt: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  card?: { fullName?: string; slug?: string };
};

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'BUSINESS'>('FREE');
  const [me, setMe] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [followupTpl, setFollowupTpl] = useState<string>(
    typeof window !== 'undefined'
      ? (localStorage.getItem('gleego_followup_tpl') ||
        'Olá {nome}! Aqui é {empresa}. Vi que você deixou seu contato no nosso link. Posso te ajudar?')
      : ''
  );

  useEffect(() => {
    (async () => {
      try {
        const [list, meData] = await Promise.all([
          api('/leads'),
          api('/auth/me').catch(() => null),
        ]);
        setLeads(Array.isArray(list) ? list : []);
        setMe(meData);
        if (meData?.company?.plan) setPlan(meData.company.plan);
      } catch (e: any) {
        toast.error(e?.message || 'Falha ao carregar');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isPro = plan === 'PRO' || plan === 'BUSINESS';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.phone, l.email, l.message, l.card?.fullName, l.card?.slug]
        .filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [leads, query]);

  function waLink(lead: Lead) {
    const digits = String(lead.phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const empresa = me?.company?.name || 'Glee-go';
    const msg = followupTpl
      .replaceAll('{nome}', (lead.name || '').split(' ')[0] || 'tudo bem')
      .replaceAll('{empresa}', empresa)
      .replaceAll('{cartao}', lead.card?.fullName || '');
    return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  }

  async function downloadExport(format: 'csv' | 'xlsx') {
    if (!isPro) {
      toast.error('Exportação disponível nos planos Pro e Business.');
      return;
    }
    try {
      const token = localStorage.getItem('gleego_token');
      const res = await fetch(`${API}/api/leads/export.${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `leads-${Date.now()}.${format}`;
      document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exportado!`);
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao exportar');
    }
  }

  function saveTemplate(v: string) {
    setFollowupTpl(v);
    try { localStorage.setItem('gleego_followup_tpl', v); } catch {}
  }

  return (
    <main className="min-h-screen text-white">
      <header className="bg-[var(--ge-surface)] border-b border-white/5 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={28} href="/dashboard" />
            <span className="text-sm text-white/60 border-l border-white/10 pl-3">Leads</span>
          </div>
          <Link href="/dashboard" className="text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5">← Dashboard</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header / actions */}
        <section className="ge-card p-5 sm:p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Leads capturados</h1>
            <p className="text-sm text-white/60 mt-1">
              {leads.length} {leads.length === 1 ? 'lead' : 'leads'} no total · plano{' '}
              <b className={isPro ? 'text-[var(--ge-green)]' : 'text-white/80'}>{plan}</b>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => downloadExport('xlsx')}
              disabled={!isPro}
              title={isPro ? 'Exportar leads em Excel (.xlsx)' : 'Disponível nos planos Pro e Business'}
              className="ge-btn px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬇ Exportar Excel {!isPro && '(Pro)'}
            </button>
            <button
              onClick={() => downloadExport('csv')}
              disabled={!isPro}
              title={isPro ? 'Exportar leads em CSV' : 'Disponível nos planos Pro e Business'}
              className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⬇ Exportar CSV {!isPro && '(Pro)'}
            </button>
          </div>
        </section>

        {/* Upgrade banner */}
        {!isPro && (
          <section className="rounded-2xl p-5 border border-[rgba(34,211,106,.25)]"
            style={{ background: 'linear-gradient(135deg,#071a10,#0a1117 60%)' }}>
            <h3 className="font-semibold">Desbloqueie o follow-up profissional</h3>
            <p className="text-sm text-white/70 mt-1">
              No plano <b className="text-[var(--ge-green)]">Pro</b> você exporta os leads em CSV,
              sincroniza com seu CRM e dispara follow-up automático pelo WhatsApp com um clique.
            </p>
            <Link href="/dashboard" className="inline-block mt-3 text-sm font-semibold text-[var(--ge-green)]">
              Solicitar upgrade →
            </Link>
          </section>
        )}

        {/* Follow-up template */}
        <section className="ge-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="font-semibold">Mensagem de follow-up</h2>
            <span className="text-xs text-white/40">Variáveis: {'{nome}'} {'{empresa}'} {'{cartao}'}</span>
          </div>
          <textarea
            value={followupTpl}
            onChange={(e) => saveTemplate(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-[var(--ge-surface-2)] border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
          />
          <p className="text-xs text-white/50 mt-2">
            Clique em <b>WhatsApp</b> em qualquer lead para abrir uma conversa com a mensagem já preenchida.
          </p>
        </section>

        {/* Search + table */}
        <section className="ge-card p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, telefone, email, cartão..."
              className="w-full rounded-xl bg-[var(--ge-surface-2)] border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>
          {loading ? (
            <p className="p-6 text-white/50 text-sm">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-white/50 text-sm">Nenhum lead {query ? 'para a busca.' : 'capturado ainda.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-white/50 text-xs uppercase tracking-wider">
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3">Data</th>
                    <th className="text-left px-4 py-3">Nome</th>
                    <th className="text-left px-4 py-3">Contato</th>
                    <th className="text-left px-4 py-3">Cartão</th>
                    <th className="text-left px-4 py-3">Origem</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => (
                    <tr key={l.id} className="border-b border-white/5 hover:bg-white/[.02]">
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-medium">{l.name}</td>
                      <td className="px-4 py-3 text-white/70">
                        {l.phone && <div>{l.phone}</div>}
                        {l.email && <div className="text-white/50 text-xs">{l.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-white/70">{l.card?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">
                        {[l.utmSource, l.utmMedium, l.utmCampaign].filter(Boolean).join(' / ') || 'direto'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {l.phone && (
                            <a href={waLink(l)} target="_blank" rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--ge-green)]/15 border border-[var(--ge-green)]/30 text-[var(--ge-green)] hover:bg-[var(--ge-green)]/25">
                              WhatsApp
                            </a>
                          )}
                          {l.email && (
                            <a href={`mailto:${l.email}`} className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5">
                              E-mail
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}