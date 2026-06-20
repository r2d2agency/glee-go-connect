import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glee-go ID — Cartões digitais NFC/QR',
  description: 'Plataforma SaaS de cartões digitais NFC e QR Code.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}