'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      localStorage.setItem('gleego_token', token);
      toast.success('Bem-vindo de volta!');
      // Se a conta ainda não está configurada (sem cartões), abre o Wizard.
      try {
        const cards = await api('/cards');
        if (!Array.isArray(cards) || cards.length === 0) {
          router.push('/onboarding');
          return;
        }
      } catch {}
      router.push('/dashboard');
    } catch (err) {
      toast.error(humanizeError(err, 'Não foi possível entrar.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white p-6 sm:p-8 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-slate-500 mt-1">Acesse seu painel Glee-go ID.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Email</label>
          <input required type="email" className="w-full border rounded-lg px-3 py-2.5" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600">Senha</label>
          <input required type="password" className="w-full border rounded-lg px-3 py-2.5" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Não tem conta?{' '}
          <a href="/auth/register" className="text-blue-700 font-medium hover:underline">Criar grátis</a>
        </p>
      </form>
    </main>
  );
}