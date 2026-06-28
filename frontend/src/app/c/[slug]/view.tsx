'use client';
import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BIO_DOMAIN } from '@/lib/bio-url';

type Link = { label: string; url: string; icon?: string };
type Area = { label: string; icon?: string; description?: string };
type Product = {
  photo?: string; title: string; description?: string; price?: string;
  link?: string; category?: string;
  kind?: 'product' | 'digital';
  fileUrl?: string; fileName?: string;
};

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
  website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M4.1 12H7c.1 1.7.4 3.3.9 4.7.6 1.5 1.3 2.6 2.1 3.2A8 8 0 0 1 4.1 12m3-2c0-1.4.2-2.7.5-3.9.2-.8.5-1.5.8-2H9.7c-1.2 0-2.3 1-2.4 2.4-.2.7-.3 1.4-.3 3.5zM12 4c.5.3 1 .9 1.5 1.7.4.6.7 1.4 1 2.3H9.5c.3-.9.6-1.7 1-2.3.5-.8 1-1.4 1.5-1.7',
  location: 'M12 2a8 8 0 0 0-8 8c0 5.4 7 11.5 7.3 11.7a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8m0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6',
  briefcase: 'M9 4h6a2 2 0 0 1 2 2v1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a1 1 0 0 1 1-1h4V6a2 2 0 0 1 2-2m6 3V6H9v1z',
  cube: 'M12 2 3 7v10l9 5 9-5V7zm0 2.2 6.4 3.6L12 11.4 5.6 7.8zM5 9.6l6 3.4v7.1L5 16.7z',
  gear: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m10 4a10 10 0 0 1-.1 1.4l2.1 1.6-2 3.5-2.5-1a8 8 0 0 1-2.4 1.4L17 22h-4l-.4-2.7a8 8 0 0 1-2.4-1.4l-2.5 1-2-3.5 2.1-1.6A10 10 0 0 1 7.7 12c0-.5 0-1 .1-1.4L5.7 9l2-3.5 2.5 1a8 8 0 0 1 2.4-1.4L13 2h4l.4 2.7a8 8 0 0 1 2.4 1.4l2.5-1 2 3.5-2.1 1.6c.1.5.1 1 .1 1.4',
  play: 'M5 4v16l14-8z',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12',
  lightbulb: 'M12 2a7 7 0 0 0-4 12.7V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3A7 7 0 0 0 12 2M9 21a1 1 0 0 1 1-1h4a1 1 0 0 1 0 2h-4a1 1 0 0 1-1-1',
  target: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12m0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m6 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 19c0-3 4-5 7-5s7 2 7 5v1H2zm14 1v-1c0-1.7-.8-3-2-4 3 .3 6 2 6 4v1z',
  bars: 'M4 18h4v-7H4zm6 0h4V6h-4zm6 0h4v-4h-4z',
};

function Icon({ name, className, color }: { name?: string; className?: string; color?: string }) {
  const key = (name || '').toLowerCase();
  const path = ICONS[key] || ICONS.website;
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color || 'currentColor'}>
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
  if (t.includes('apresenta')) return 'user';
  if (t.includes('portfó') || t.includes('portfolio')) return 'briefcase';
  if (t.includes('catá') || t.includes('produto')) return 'cube';
  if (t.includes('serviç') || t.includes('servic')) return 'gear';
  if (t.includes('vídeo') || t.includes('video')) return 'play';
  if (t.includes('depoimento')) return 'chat';
  if (t.includes('fale') || t.includes('contato') || t.includes('mensagem')) return 'chat';
  if (t.includes('mail') || t.includes('@') || t.includes('email')) return 'email';
  if (t.includes('tel') || t.includes('fone') || t.includes('ligar') || t.includes('phone')) return 'phone';
  if (t.includes('site') || t.includes('web')) return 'website';
  if (t.includes('local') || t.includes('endere') || t.includes('mapa')) return 'location';
  return 'website';
}

const ICON_COLORS = ['#22ff88', '#38bdf8', '#fbbf24', '#c084fc', '#ff5577', '#22d3ee', '#f472b6', '#fb923c'];

export function PublicCardView({ card, vcardUrl }: { card: any; vcardUrl: string }) {
  const primary = card.primaryColor || '#22c55e';
  const accent = card.accentColor || '#3b82f6';
  const bg = card.bgColor || '#050912';

  const buttons: Link[] = Array.isArray(card.customButtons) ? card.customButtons : [];
  const socials: Link[] = Array.isArray(card.socialLinks) ? card.socialLinks : [];
  const areas: Area[] = Array.isArray(card.areas) ? card.areas : [];
  const services: { icon?: string; title: string; description?: string }[] =
    Array.isArray(card.services) ? card.services.filter((s: any) => s && s.title) : [];
  const areasHaveDesc = areas.some((a) => a.description && a.description.trim());
  const categories: string[] = (Array.isArray(card.categories) ? card.categories : []).filter(Boolean);
  const products: Product[] = (Array.isArray(card.products) ? card.products : []).filter((p: Product) => p && p.title);
  const gallery: string[] = (Array.isArray(card.gallery) ? card.gallery : []).filter(Boolean);
  const [activeCat, setActiveCat] = useState<string>('Todos');
  const [lightbox, setLightbox] = useState<{ list: string[]; index: number } | null>(null);
  const openLightbox = (list: string[], index: number) => setLightbox({ list, index });
  const closeLightbox = () => setLightbox(null);
  const lightboxPrev = () => setLightbox((s) => s ? { ...s, index: (s.index - 1 + s.list.length) % s.list.length } : s);
  const lightboxNext = () => setLightbox((s) => s ? { ...s, index: (s.index + 1) % s.list.length } : s);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);
  const filteredProducts = useMemo(
    () => activeCat === 'Todos' ? products : products.filter((p) => (p.category || '') === activeCat),
    [products, activeCat]
  );

  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => { if (typeof window !== 'undefined') setShareUrl(window.location.href); }, []);

  // Lead gate (catálogo)
  const plan: string = card?.company?.plan || 'FREE';
  const productLimit = plan === 'BUSINESS' ? 10 : plan === 'PRO' ? 5 : 1;
  const limitedProducts = useMemo(() => products.slice(0, productLimit), [products, productLimit]);
  const limitedFiltered = useMemo(
    () => activeCat === 'Todos' ? limitedProducts : limitedProducts.filter((p) => (p.category || '') === activeCat),
    [limitedProducts, activeCat]
  );
  const gateRequired = !!card.catalogLeadGate && limitedProducts.length > 0;
  const storageKey = `ge_lead_${card.slug}`;
  const [unlocked, setUnlocked] = useState(!gateRequired);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !gateRequired) return;
    try { if (localStorage.getItem(storageKey)) setUnlocked(true); } catch {}
  }, [gateRequired, storageKey]);

  function requireUnlock(action: () => void) {
    if (unlocked || !gateRequired) { action(); return; }
    setPendingAction(() => action);
    setGateOpen(true);
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
      const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      await fetch(`${API}/api/leads/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: card.slug,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          message: 'Acesso ao catálogo',
          utmSource: p.get('utm_source') || undefined,
          utmMedium: p.get('utm_medium') || undefined,
          utmCampaign: p.get('utm_campaign') || undefined,
        }),
      });
      try { localStorage.setItem(storageKey, JSON.stringify({ ...form, at: Date.now() })); } catch {}
      setUnlocked(true);
      setGateOpen(false);
      if (pendingAction) { const a = pendingAction; setPendingAction(null); setTimeout(a, 50); }
    } catch {
      setUnlocked(true); // best-effort: não bloquear visitante
      setGateOpen(false);
      if (pendingAction) { const a = pendingAction; setPendingAction(null); setTimeout(a, 50); }
    } finally {
      setSubmitting(false);
    }
  }

  // Track view + UTM/referrer/origin (client-side, best-effort)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const p = new URLSearchParams(window.location.search);
      const payload: any = {
        referrer: document.referrer || null,
        language: navigator.language || null,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        path: window.location.pathname,
        utmSource: p.get('utm_source'),
        utmMedium: p.get('utm_medium'),
        utmCampaign: p.get('utm_campaign'),
        utmTerm: p.get('utm_term'),
        utmContent: p.get('utm_content'),
      };
      const API = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
      fetch(`${API}/api/public/cards/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({ slug: card.slug, type: 'view', payload }),
      }).catch(() => {});

      // Meta Pixel
      if (card.metaPixelId && !(window as any).fbq) {
        (function (f: any, b: any, e: any, v: any) {
          if (f.fbq) return; const n: any = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
          const t = b.createElement(e); t.async = true; t.src = v;
          const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        (window as any).fbq('init', card.metaPixelId);
        (window as any).fbq('track', 'PageView');
      }
      // Google Analytics 4
      if (card.gaId && !(window as any).gtag) {
        const s = document.createElement('script');
        s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${card.gaId}`;
        document.head.appendChild(s);
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
        (window as any).gtag = gtag;
        gtag('js', new Date());
        gtag('config', card.gaId);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickActions = useMemo(() => {
    const hidden: string[] = Array.isArray(card.hiddenQuickActions) ? card.hiddenQuickActions : [];
    const wa = String(card.whatsapp || '').replace(/\D/g, '');
    const base = [
      { key: 'whatsapp', icon: 'whatsapp', label: 'WhatsApp', href: wa ? `https://wa.me/${wa}` : '', color: primary },
      { key: 'phone',    icon: 'phone',    label: 'Ligar',        href: card.phone ? `tel:${card.phone}` : '', color: accent },
      { key: 'email',    icon: 'email',    label: 'E-mail',       href: card.email ? `mailto:${card.email}` : '', color: primary },
      { key: 'website',  icon: 'website',  label: 'Site',         href: card.website || '', color: accent },
      { key: 'location', icon: 'location', label: 'Localização',  href: card.location ? `https://maps.google.com/?q=${encodeURIComponent(card.location)}` : '', color: primary },
    ];
    return base.filter((b) => !hidden.includes(b.key) && !!b.href);
  }, [card, primary, accent]);

  return (
    <main style={{ background: bg }} className="min-h-screen text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-30" style={{ background: primary }} />
      <div aria-hidden className="pointer-events-none absolute -top-20 right-0 w-[420px] h-[420px] rounded-full blur-3xl opacity-20" style={{ background: accent }} />

      <style>{`
        @keyframes geRise { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform:none; } }
        @keyframes geFade { from { opacity:0; } to { opacity:1; } }
        @keyframes geGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } 50% { box-shadow: 0 0 24px 2px ${primary}55; } }
        @keyframes geNeon { 0%,100% { box-shadow: 0 0 12px var(--neon), 0 0 24px var(--neon); } 50% { box-shadow: 0 0 22px var(--neon), 0 0 44px var(--neon); } }
        @keyframes geFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes geSpinSlow { to { transform: rotate(360deg); } }
        .ge-rise { animation: geRise .7s cubic-bezier(.2,.7,.2,1) both; }
        .ge-fade { animation: geFade .8s ease both; }
        .ge-glow { animation: geGlow 2.6s ease-in-out infinite; }
        .ge-neon { animation: geNeon 2.4s ease-in-out infinite; }
        .ge-float { animation: geFloat 4s ease-in-out infinite; }
        .ge-ring-spin::before {
          content:''; position:absolute; inset:-2px; border-radius:9999px;
          background: conic-gradient(from 0deg, transparent, ${primary}, transparent 60%);
          animation: geSpinSlow 4s linear infinite; z-index:0;
        }
      `}</style>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* BANNER */}
        {card.bannerUrl && (
          <section className="mb-5 rounded-3xl overflow-hidden border border-white/10 relative ge-fade">
            <img src={card.bannerUrl} alt="Banner" className="w-full h-44 sm:h-64 object-cover" />
            {(card.bannerCtaLabel && card.bannerCtaUrl) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
                <a href={card.bannerCtaUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: primary, color: '#04130a' }}>
                  {card.bannerCtaLabel} →
                </a>
              </div>
            )}
          </section>
        )}

        {/* Brand header */}
        <header className="flex items-start justify-between gap-4 ge-fade">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl sm:text-2xl">Glee-go</span>
              <span className="px-2 py-0.5 rounded-md font-bold text-sm" style={{ background: primary, color: '#04130a' }}>ID</span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Seu jeito. Seu link. Suas conexões.</p>
          </div>
          <div className="text-right rounded-xl px-3 py-2 border border-white/10 bg-white/[.03]">
            <div className="text-[10px] text-white/60 leading-tight">Link da bio inteligente</div>
            <div className="text-xs font-bold" style={{ color: primary }}>100% GRATUITO</div>
          </div>
        </header>

        {/* HERO */}
        <section className="mt-5 rounded-3xl p-5 sm:p-7 border ge-rise" style={{ borderColor: 'rgba(255,255,255,.08)', background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01))' }}>
          <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 md:gap-7 items-center">
            {/* Avatar */}
            <div className="mx-auto md:mx-0">
              {(() => {
                const isRounded = (card as any).avatarShape === 'rounded';
                const outer = isRounded ? 'rounded-3xl' : 'rounded-full';
                const inner = isRounded ? 'rounded-[20px]' : 'rounded-full';
                return (
                  <div className={`relative size-36 sm:size-44 ${outer} p-[3px] ge-glow`} style={{ background: `conic-gradient(from 120deg, ${primary}, ${accent}, ${primary})` }}>
                    <div className={`size-full ${inner} overflow-hidden bg-black/40 grid place-items-center`}>
                      {card.avatarUrl
                        ? <img src={card.avatarUrl} alt={card.fullName} className="size-full object-contain bg-black/40" style={{ objectPosition: 'center' }} />
                        : <span className="text-4xl font-bold text-white/40">{card.fullName?.[0] ?? '?'}</span>}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Identity */}
            <div className="text-center md:text-left min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span className="truncate">{card.fullName}</span>
                {card.verified && (
                  <svg viewBox="0 0 24 24" className="size-6 shrink-0">
                    <path fill={primary} d="m12 1 2.4 3 3.8.4-2.2 3.1 1.2 3.7L12 9.6 6.8 11.2 8 7.5 5.8 4.4 9.6 4z" />
                    <path d="m9 12 2 2 4-4" stroke="#04130a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </h1>
              {card.jobTitle && <p className="mt-1 font-semibold" style={{ color: primary }}>{card.jobTitle}</p>}
              {(card.companyName || card.companyLogoUrl) && (
                <div className="mt-1 flex items-center justify-center md:justify-start gap-2 text-white/70">
                  {card.companyLogoUrl && <img src={card.companyLogoUrl} alt={card.companyName || ''} className="size-5 rounded object-contain bg-white/10 p-0.5" />}
                  <span className="text-sm">{card.companyName}</span>
                </div>
              )}
              {card.tagline && <p className="mt-3 text-white/75 text-sm max-w-md">{card.tagline}</p>}
              <a href={vcardUrl}
                 className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white/[.06] hover:bg-white/[.1] border border-white/10 transition">
                <Icon name="user" className="size-4" color="#fff" />
                Salvar contato
              </a>
            </div>

            {/* QR */}
            <div className="hidden md:flex flex-col items-center gap-2">
              <span className="text-xs text-white/60">Compartilhe meu link</span>
              <div className="rounded-2xl p-2 bg-white">
                {shareUrl && <QRCodeSVG value={shareUrl} size={132} bgColor="#ffffff" fgColor="#0a0f1f" />}
              </div>
              <span className="text-xs font-semibold truncate max-w-[180px]" style={{ color: primary }}>{BIO_DOMAIN}/{card.slug}</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS — só exibe os contatos preenchidos */}
        {quickActions.length > 0 && (
          <section
            className="mt-5 grid gap-3"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${quickActions.length <= 2 ? '160px' : '130px'}, 1fr))`,
            }}
          >
            {quickActions.map((q, i) => {
              const filled = true;
              const props: any = { href: q.href, target: q.href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' };
              return (
                <a key={q.key} {...props}
                  className="ge-rise group relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition overflow-hidden hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    borderColor: `${q.color}44`,
                    background: `linear-gradient(160deg, ${q.color}1f, rgba(255,255,255,.02) 70%)`,
                    boxShadow: `0 0 18px ${q.color}26, inset 0 0 22px ${q.color}14`,
                  }}>
                  <span className="relative size-12 grid place-items-center rounded-full transition group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${q.color}44, ${q.color}10 70%)`,
                      boxShadow: `0 0 18px ${q.color}cc, 0 0 36px ${q.color}55, inset 0 0 14px ${q.color}55`,
                      border: `1.5px solid ${q.color}aa`,
                    }}>
                    <Icon name={q.icon} className="size-5" color="#ffffff" />
                  </span>
                  <span className="text-xs font-semibold text-white">{q.label}</span>
                </a>
              );
            })}
          </section>
        )}

        {/* ABOUT */}
        {card.bio && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6 ge-rise">
            <div className="flex items-start gap-4">
              <span className="size-11 grid place-items-center rounded-full border border-white/10" style={{ background: `${primary}22`, color: primary }}>
                <Icon name="user" className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Sobre mim</h2>
                <p className="mt-1 text-sm text-white/70 whitespace-pre-line leading-relaxed">{card.bio}</p>
              </div>
            </div>
          </section>
        )}

        {/* AREAS */}
        {areas.length > 0 && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6 ge-rise">
            <h2 className="text-[11px] tracking-[0.18em] text-white/50 font-semibold">ÁREA DE ATUAÇÃO</h2>
            {areasHaveDesc ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {areas.map((a, i) => (
                  <div key={i} className="ge-rise rounded-xl border p-3 text-center bg-white/[.02]"
                       style={{ borderColor: i === 0 ? primary : 'rgba(255,255,255,.1)', animationDelay: `${i * 50}ms` }}>
                    <span className="mx-auto mb-2 size-10 grid place-items-center rounded-lg"
                          style={{ background: `${primary}1a`, color: primary }}>
                      <Icon name={a.icon || ICON_OPTIONS[i % ICON_OPTIONS.length]} className="size-5" />
                    </span>
                    <div className="text-sm font-semibold leading-tight" style={{ color: i === 0 ? primary : '#fff' }}>{a.label}</div>
                    {a.description && <div className="text-[11px] text-white/55 mt-1 leading-snug">{a.description}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {areas.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm"
                        style={{ borderColor: i === 0 ? primary : 'rgba(255,255,255,.1)', background: i === 0 ? `${primary}1a` : 'transparent', color: i === 0 ? primary : '#fff' }}>
                    <Icon name={a.icon || ICON_OPTIONS[i % ICON_OPTIONS.length]} className="size-4" color={ICON_COLORS[i % ICON_COLORS.length]} />
                    {a.label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-white/50">Clique nas categorias para saber mais sobre minha atuação.</p>
          </section>
        )}

        {/* SERVIÇOS — Como posso te ajudar */}
        {services.length > 0 && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
            <h2 className="text-[11px] tracking-[0.18em] text-white/50 font-semibold">COMO POSSO TE AJUDAR</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {services.map((s, i) => (
                <div key={i} className="ge-rise rounded-xl border border-white/10 bg-white/[.02] p-3 text-center"
                     style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="mx-auto mb-2 size-11 grid place-items-center rounded-full"
                        style={{ background: `${ICON_COLORS[i % ICON_COLORS.length]}1f`, color: ICON_COLORS[i % ICON_COLORS.length] }}>
                    <Icon name={s.icon || 'briefcase'} className="size-5" />
                  </span>
                  <div className="text-sm font-semibold leading-tight">{s.title}</div>
                  {s.description && <div className="text-[11px] text-white/60 mt-1 leading-snug">{s.description}</div>}
                </div>
              ))}
            </div>
            {card.servicesCtaLabel && card.servicesCtaUrl && (
              <div className="mt-5 flex justify-center">
                <a href={card.servicesCtaUrl} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border"
                   style={{ borderColor: primary, color: primary, background: `${primary}10` }}>
                  <Icon name="whatsapp" className="size-4" color={primary} />
                  {card.servicesCtaLabel}
                </a>
              </div>
            )}
          </section>
        )}

        {/* CONTENTS */}
        {buttons.length > 0 && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
            <h2 className="text-[11px] tracking-[0.18em] text-white/50 font-semibold mb-3">CONTEÚDOS</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {buttons.filter((b) => b.label && b.url).map((b, i) => {
                const icon = guessIcon(b);
                const color = ICON_COLORS[i % ICON_COLORS.length];
                return (
                  <a key={i} href={b.url} target="_blank" rel="noreferrer"
                     className="ge-rise group flex items-center gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[.02] hover:bg-white/[.06] hover:translate-x-0.5 transition"
                     style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="size-11 shrink-0 grid place-items-center rounded-xl" style={{ background: `${color}1f`, color }}>
                      <Icon name={icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold truncate">{b.label}</span>
                      <span className="block text-xs text-white/55 truncate">{b.url.replace(/^https?:\/\//, '')}</span>
                    </span>
                    <svg viewBox="0 0 24 24" className="size-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* SOCIALS row — neon glow */}
        {socials.length > 0 && (
          <section className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {socials.filter((s) => s.url).map((s, i) => {
              const icon = guessIcon(s);
              const color = ICON_COLORS[i % ICON_COLORS.length];
              return (
                <a key={i} href={s.url} target="_blank" rel="noreferrer"
                   aria-label={s.label || icon}
                   className="ge-rise group relative size-14 grid place-items-center rounded-full transition hover:scale-110 hover:-translate-y-1"
                   style={{
                     animationDelay: `${i * 70}ms`,
                     color,
                     background: `radial-gradient(circle at 30% 25%, ${color}66, ${color}10 70%, transparent)`,
                     boxShadow: `0 0 14px ${color}99, 0 0 32px ${color}55, inset 0 0 12px ${color}55`,
                     border: `1.5px solid ${color}aa`,
                   }}>
                  <Icon name={icon} className="size-6 drop-shadow-[0_0_8px_currentColor]" />
                  <span aria-hidden className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
                        style={{ boxShadow: `0 0 28px ${color}, 0 0 56px ${color}88` }} />
                </a>
              );
            })}
          </section>
        )}

        {/* CATÁLOGO */}
        {limitedProducts.length > 0 && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[11px] tracking-[0.18em] text-white/50 font-semibold">CATÁLOGO</h2>
                <p className="text-lg font-semibold mt-1">Meus produtos e serviços</p>
              </div>
              <span className="text-xs text-white/50">{limitedFiltered.length} {limitedFiltered.length === 1 ? 'item' : 'itens'}</span>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {['Todos', ...categories].map((c) => (
                  <button key={c} onClick={() => setActiveCat(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border transition"
                    style={{
                      background: activeCat === c ? primary : 'transparent',
                      color: activeCat === c ? '#04130a' : '#fff',
                      borderColor: activeCat === c ? primary : 'rgba(255,255,255,.15)',
                    }}>{c}</button>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 relative">
              {limitedFiltered.map((p, i) => (
                <article key={i} className="ge-rise group rounded-2xl border border-white/10 bg-white/[.02] overflow-hidden hover:bg-white/[.05] transition"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  {p.photo && (
                    <button onClick={() => requireUnlock(() => setLightbox(p.photo!))} className="block w-full aspect-[16/10] overflow-hidden bg-black/30">
                      <img src={p.photo} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </button>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{p.title}</h3>
                      {p.price && <span className="text-sm font-bold whitespace-nowrap" style={{ color: primary }}>{p.price}</span>}
                    </div>
                    {p.description && <p className="text-sm text-white/65 mt-1.5 line-clamp-3">{p.description}</p>}
                    {p.category && <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-white/40">{p.category}</span>}
                    {p.kind === 'digital' && p.fileUrl ? (
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={p.fileName || true}
                        onClick={(e) => {
                          if (!unlocked && gateRequired) {
                            e.preventDefault();
                            const url = p.fileUrl!;
                            requireUnlock(() => window.open(url, '_blank'));
                          }
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition hover:brightness-110"
                        style={{ background: primary, color: '#04130a', boxShadow: `0 6px 20px ${primary}55` }}
                      >
                        ⬇ Baixar {p.fileName ? '' : 'conteúdo'}
                      </a>
                    ) : p.link ? (
                      <a href={p.link} target="_blank" rel="noreferrer"
                        onClick={(e) => {
                          if (!unlocked && gateRequired) {
                            e.preventDefault();
                            const url = p.link!;
                            requireUnlock(() => window.open(url, '_blank'));
                          }
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                        style={{ color: primary }}>
                        Saiba mais →
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {gateRequired && !unlocked && (
              <p className="mt-4 text-center text-xs text-white/50">
                🔒 Toque em um item para liberar o acesso ao conteúdo.
              </p>
            )}
          </section>
        )}

        {/* GALERIA */}
        {gallery.length > 0 && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
            <h2 className="text-[11px] tracking-[0.18em] text-white/50 font-semibold mb-3">GALERIA</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {gallery.map((url, i) => (
                <button key={i} onClick={() => setLightbox(url)}
                  className="ge-rise aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/30 group"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* LIGHTBOX */}
        {lightbox && (
          <div onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4 ge-fade">
            <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white text-xl">×</button>
          </div>
        )}

        {/* LEAD GATE POPUP */}
        {gateOpen && !unlocked && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-4 ge-fade"
               onClick={() => { setGateOpen(false); setPendingAction(null); }}>
            <form onSubmit={submitLead} onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 p-6 sm:p-7 ge-rise relative"
              style={{ background: `linear-gradient(180deg, ${primary}14, #0a0f1a)` }}>
              <button type="button" onClick={() => { setGateOpen(false); setPendingAction(null); }}
                className="absolute top-3 right-3 size-8 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white">×</button>
              <div className="text-center">
                <div className="mx-auto size-12 grid place-items-center rounded-full mb-3"
                     style={{ background: `${primary}22`, color: primary, boxShadow: `0 0 24px ${primary}55` }}>
                  <Icon name="cube" className="size-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">Acesse o conteúdo</h3>
                <p className="text-sm text-white/65 mt-1">Preencha seus dados para liberar o acesso.</p>
              </div>
              <div className="mt-5 grid gap-3 text-left">
                <input required placeholder="Seu nome" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl bg-white/[.05] border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30" />
                <input required placeholder="WhatsApp (com DDD)" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  inputMode="tel"
                  className="w-full rounded-xl bg-white/[.05] border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30" />
                <input type="email" placeholder="E-mail (opcional)" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl bg-white/[.05] border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30" />
                <button type="submit" disabled={submitting}
                  className="mt-1 w-full rounded-xl px-4 py-3 font-semibold text-sm disabled:opacity-60"
                  style={{ background: primary, color: '#04130a', boxShadow: `0 0 24px ${primary}66` }}>
                  {submitting ? 'Enviando...' : 'Liberar acesso →'}
                </button>
                <p className="text-[11px] text-white/40 text-center">Seus dados são enviados apenas para o autor deste perfil.</p>
              </div>
            </form>
          </div>
        )}

        {/* NFC UPGRADE BANNER */}
        <section className="mt-6 rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #0a1024, #0b1d12)` }}>
          <div className="relative max-w-md">
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Leve sua presença<br />
              <span style={{ color: primary }}>para o próximo nível!</span>
            </h3>
            <p className="mt-3 text-sm text-white/70">Adquira um cartão ou tag NFC Glee-go ID e compartilhe seu perfil com um toque.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href="/upgrade" className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90">
                Quero meu cartão NFC →
              </a>
              <a href="/upgrade" className="text-sm font-medium" style={{ color: primary }}>Ver modelos disponíveis →</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between text-center">
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="font-bold">Glee-go</span>
              <span className="px-1.5 py-0.5 rounded font-bold text-xs" style={{ background: primary, color: '#04130a' }}>ID</span>
            </div>
            <p className="text-xs text-white/50">Sua identidade. Seu link.<br/>Seu jeito de se conectar.</p>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Glee-go ID. Todos os direitos reservados.</p>
          <a href={`https://${BIO_DOMAIN}`} className="text-sm font-semibold inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition hover:-translate-y-0.5"
             style={{ borderColor: primary, color: primary, boxShadow: `0 0 14px ${primary}66` }}>
            {BIO_DOMAIN}/criar →
          </a>
        </footer>
      </div>
    </main>
  );
}

const ICON_OPTIONS = ['lightbulb', 'bars', 'users', 'cube', 'target', 'gear', 'briefcase', 'chat'];