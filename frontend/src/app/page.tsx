import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold mb-4">Glee-go ID</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-xl">
        Cartões digitais NFC e QR Code com captura de leads, analytics e SEO.
      </p>
      <div className="flex gap-4">
        <Link href="/auth/login" className="px-6 py-3 bg-primary text-white rounded-lg">Entrar</Link>
        <Link href="/auth/register" className="px-6 py-3 border border-primary text-primary rounded-lg">Criar conta</Link>
      </div>
    </main>
  );
}