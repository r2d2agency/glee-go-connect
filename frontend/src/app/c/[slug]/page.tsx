type Props = { params: { slug: string } };
type Link = { label: string; url: string; icon?: string };

async function getCard(slug: string) {
  const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  const res = await fetch(`${API}/api/public/cards/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props) {
  const card = await getCard(params.slug);
  if (!card) return { title: 'Cartão não encontrado' };
  return {
    title: card.seoTitle || `${card.fullName} — Glee-go ID`,
    description: card.seoDescription || card.bio || `${card.fullName} no Glee-go ID`,
    openGraph: { images: card.avatarUrl ? [card.avatarUrl] : [] },
  };
}

// Slug → SVG inline (apenas ícones essenciais p/ social)
const ICONS: Record<string, string> = {
  whatsapp: 'M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.02M12.04 20.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.23 8.23',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10m6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6',
  linkedin: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9z',
  email: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m8 7L4 6v2l8 5 8-5V6z',
  phone: 'M6.6 10.8a15.05 15.05 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.5.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.57 3.5a1 1 0 0 1-.25 1z',
  facebook: 'M22 12a10 10 0 1 0-11.6 9.9V14.9H7.9V12h2.6V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12',
  youtube: 'M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.8-.9-2.3-1C16.5 3.5 12 3.5 12 3.5s-4.5 0-7.8.4c-.4 0-1.4 0-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9 .8 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.6.9 2.3c.9 1 2.1.9 2.7 1 1.9.2 7.4.3 7.4.3s4.5 0 7.8-.4c.4 0 1.4 0 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6M9.8 14.7V8.4l5.8 3.2z',
  tiktok: 'M19.6 6.3a4.6 4.6 0 0 1-2.7-.9 4.7 4.7 0 0 1-1.9-3H11.3v12c0 1.4-1.1 2.5-2.5 2.5a2.5 2.5 0 0 1 0-5c.3 0 .5 0 .7.1V8.4a6.2 6.2 0 1 0 5.5 6.1V9.7a7.8 7.8 0 0 0 4.6 1.5z',
  twitter: 'M22.5 5.9c-.8.4-1.6.6-2.5.7a4.3 4.3 0 0 0 1.9-2.4 8.7 8.7 0 0 1-2.7 1A4.4 4.4 0 0 0 11.7 9c0 .3 0 .7.1 1A12.4 12.4 0 0 1 2.8 5.5a4.4 4.4 0 0 0 1.4 5.9 4.4 4.4 0 0 1-2-.6v.1c0 2.1 1.5 3.9 3.5 4.3a4.4 4.4 0 0 1-2 .1 4.4 4.4 0 0 0 4.1 3 8.8 8.8 0 0 1-5.4 1.9c-.4 0-.7 0-1-.1A12.4 12.4 0 0 0 8 22c8 0 12.4-6.7 12.4-12.4v-.6c.9-.6 1.6-1.4 2.1-2.2',
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 17.9A8 8 0 0 1 4.1 12H7c.1 1.7.4 3.3.9 4.7.6 1.5 1.3 2.6 2.1 3.2m-3-7.9c0-1.4.2-2.7.5-3.9.2-.8.5-1.5.8-2H9.7c-1.2 0-2.3 1-2.4 2.4-.2.7-.3 1.4-.3 3.5zM12 4c.5.3 1 .9 1.5 1.7.4.6.7 1.4 1 2.3H9.5c.3-.9.6-1.7 1-2.3.5-.8 1-1.4 1.5-1.7m1 16c-.5-.3-1-.9-1.5-1.7-.4-.6-.7-1.4-1-2.3h5c-.3.9-.6 1.7-1 2.3-.5.8-1 1.4-1.5 1.7m-1-7c-1 0-1.9 0-2.7-.1V12c0-1 0-1.9.1-2.7h5.2c.1.8.1 1.7.1 2.7v.9c-.8 0-1.7.1-2.7.1m4.6 6.9c.8-.6 1.5-1.7 2.1-3.2.5-1.4.8-3 .9-4.7h2.9a8 8 0 0 1-5.9 7.9M19.9 12h-2.9c-.1-1.7-.4-3.3-.9-4.7-.6-1.5-1.3-2.6-2.1-3.2A8 8 0 0 1 19.9 12',
};

function Icon({ name, className }: { name?: string; className?: string }) {
  const key = (name || '').toLowerCase();
  const path = ICONS[key];
  if (!path) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6v6M20 4l-9 9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={path} />
    </svg>
  );
}

function guessIcon(s: Link): string {
  if (s.icon) return s.icon;
  const t = `${s.label} ${s.url}`.toLowerCase();
  if (t.includes('whats') || t.includes('wa.me')) return 'whatsapp';
  if (t.includes('insta')) return 'instagram';
  if (t.includes('linkedin')) return 'linkedin';
  if (t.includes('youtube') || t.includes('youtu.be')) return 'youtube';
  if (t.includes('tiktok')) return 'tiktok';
  if (t.includes('twitter') || t.includes('x.com')) return 'twitter';
  if (t.includes('facebook') || t.includes('fb.com')) return 'facebook';
  if (t.includes('mail') || t.includes('@')) return 'email';
  if (t.includes('tel') || t.includes('fone') || t.includes('phone')) return 'phone';
  return 'website';
}

export default async function PublicCard({ params }: Props) {
  const card = await getCard(params.slug);
  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Página não encontrada</h1>
          <p className="text-slate-500 mt-2">Verifique o link e tente novamente.</p>
        </div>
      </main>
    );
  }

  const primary = card.primaryColor || '#2563EB';
  const accent = card.accentColor || primary;
  const bg = card.bgColor || '#0A0F1F';
  const dark = card.template !== 'minimal' && card.template !== 'cloud';
  const text = dark ? '#fff' : '#0F172A';
  const sub = dark ? 'rgba(255,255,255,.65)' : 'rgba(15,23,42,.65)';
  const surface = dark ? 'rgba(255,255,255,.04)' : 'rgba(15,23,42,.04)';
  const border = dark ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)';

  const buttons: Link[] = Array.isArray(card.customButtons) ? card.customButtons : [];
  const socials: Link[] = Array.isArray(card.socialLinks) ? card.socialLinks : [];

  return (
    <main style={{ background: bg, color: text }} className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-8 sm:py-10">
        {/* Hero card */}
        <section
          className="rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-40 opacity-60 pointer-events-none"
            style={{ background: `radial-gradient(60% 80% at 50% 0%, ${primary}40 0%, transparent 70%)` }}
          />
          <div className="relative">
            <div
              className="size-28 mx-auto rounded-full p-[3px]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {card.avatarUrl ? (
                <img src={card.avatarUrl} alt={card.fullName} className="size-full rounded-full object-cover" />
              ) : (
                <div className="size-full rounded-full grid place-items-center text-2xl font-bold" style={{ background: bg, color: text }}>
                  {card.fullName?.[0] ?? '?'}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold mt-4 flex items-center justify-center gap-2">
              <span className="truncate">{card.fullName}</span>
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill={primary}>
                <path d="M12 1l2.4 3.6 4.2.6-3 3 .8 4.2L12 10.5 7.6 12.4l.8-4.2-3-3 4.2-.6z" />
                <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </h1>
            {card.jobTitle && <p style={{ color: sub }}>{card.jobTitle}</p>}
            {card.bio && <p className="mt-2 text-sm" style={{ color: sub }}>{card.bio}</p>}

            {/* Socials row */}
            {socials.length > 0 && (
              <div className="mt-6 flex justify-center gap-4 flex-wrap">
                {socials.filter((s) => s.url).map((s, i) => {
                  const icon = guessIcon(s);
                  return (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                       className="flex flex-col items-center gap-1.5 group">
                      <span
                        className="size-12 grid place-items-center rounded-full transition group-hover:scale-110"
                        style={{ background: surface, border: `1px solid ${border}`, color: text }}
                      >
                        <Icon name={icon} className="size-5" />
                      </span>
                      <span className="text-[11px]" style={{ color: sub }}>{s.label || icon}</span>
                    </a>
                  );
                })}
              </div>
            )}

            <a
              href={`${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '')}/api/vcard/${card.slug}`}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white shadow-lg transition hover:opacity-95"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                <path d="M4 6h16v12H4zM4 8l8 5 8-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Salvar contato
            </a>
          </div>
        </section>

        {/* Links */}
        {buttons.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Meus links</h2>
            <ul className="space-y-2.5">
              {buttons.filter((b) => b.label && b.url).map((b, i) => {
                const icon = guessIcon(b);
                return (
                  <li key={i}>
                    <a href={b.url} target="_blank" rel="noreferrer"
                       className="flex items-center gap-3 p-3.5 rounded-2xl transition hover:translate-x-0.5"
                       style={{ background: surface, border: `1px solid ${border}` }}>
                      <span
                        className="size-11 shrink-0 grid place-items-center rounded-xl text-white"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                      >
                        <Icon name={icon} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold truncate">{b.label}</span>
                        <span className="block text-xs truncate" style={{ color: sub }}>{b.url.replace(/^https?:\/\//, '')}</span>
                      </span>
                      <svg viewBox="0 0 24 24" className="size-4 shrink-0" style={{ color: sub }} fill="currentColor">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* About */}
        {card.bio && (
          <section className="mt-6 rounded-2xl p-5" style={{ background: surface, border: `1px solid ${border}` }}>
            <h3 className="font-semibold mb-2">Sobre mim</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: sub }}>{card.bio}</p>
          </section>
        )}

        <p className="mt-8 text-center text-xs" style={{ color: sub }}>
          Criado com <a href="/" className="font-semibold hover:underline" style={{ color: primary }}>Glee-go ID</a>
        </p>
      </div>
    </main>
  );
}