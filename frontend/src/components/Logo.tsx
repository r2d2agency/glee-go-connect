'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

let cached: { logoUrl?: string; brandName?: string } | null = null;
let pending: Promise<any> | null = null;

function loadBranding() {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  pending = fetch(`${API}/api/branding`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((b) => { cached = b || {}; return cached; })
    .catch(() => ({}));
  return pending;
}

export function Logo({ size = 36, href = '/' }: { size?: number; withText?: boolean; href?: string | null }) {
  const [brand, setBrand] = useState<{ logoUrl?: string; brandName?: string }>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('gleego_branding') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    loadBranding().then((b) => {
      if (b) {
        setBrand(b);
        try { localStorage.setItem('gleego_branding', JSON.stringify(b)); } catch {}
      }
    });
  }, []);

  const src = brand.logoUrl || '/brand/logo.png';
  const alt = brand.brandName || 'Glee-go ID';
  const content = (
    <span className="inline-flex items-center gap-2 select-none">
      <img
        src={src}
        alt={alt}
        style={{ height: size, width: 'auto' }}
        className="drop-shadow-[0_0_18px_rgba(34,211,106,0.35)]"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand/logo.png'; }}
      />
    </span>
  );
  if (!href) return content;
  return <Link href={href} aria-label={alt}>{content}</Link>;
}