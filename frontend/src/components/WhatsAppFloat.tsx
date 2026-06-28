'use client';
import { usePathname } from 'next/navigation';

const PHONE = '5517991308048';
const MSG = encodeURIComponent('Olá! Preciso de ajuda com o Glee-go ID.');

export function WhatsAppFloat() {
  const pathname = usePathname() || '/';
  // Não exibir nas páginas públicas de cartão/bio
  if (pathname.startsWith('/c/')) return null;
  // Slug raiz público (uma única parte sem prefixos do sistema)
  const sysPrefixes = ['/', '/auth', '/dashboard', '/admin', '/onboarding', '/criar'];
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1 && !['auth', 'dashboard', 'admin', 'onboarding', 'criar'].includes(parts[0])) {
    return null;
  }
  void sysPrefixes;

  return (
    <a
      href={`https://wa.me/${PHONE}?text=${MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-[60] group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 blur-xl animate-pulse" />
      <span className="relative flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-emerald-500/30 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M19.11 17.49c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
          <path d="M26.7 5.3A14.85 14.85 0 0 0 16 1C8.27 1 2 7.27 2 15c0 2.48.65 4.9 1.88 7.04L2 31l9.18-1.84A13.94 13.94 0 0 0 16 30c7.73 0 14-6.27 14-14 0-3.74-1.46-7.26-3.3-10.7zM16 27.4a12.4 12.4 0 0 1-6.31-1.73l-.45-.27-5.45 1.09 1.1-5.31-.29-.46A12.43 12.43 0 1 1 28.4 15 12.42 12.42 0 0 1 16 27.4z" />
        </svg>
        <span className="hidden sm:inline text-sm font-semibold">Ajuda no WhatsApp</span>
      </span>
    </a>
  );
}