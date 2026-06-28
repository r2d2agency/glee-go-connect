import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

export const metadata: Metadata = {
  title: 'Glee-go ID — Bio Link e Cartões digitais',
  description: 'Crie grátis seu link bio. Faça upgrade para cartão digital NFC, vCard e captura de leads.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
        <WhatsAppFloat />
      </body>
    </html>
  );
}