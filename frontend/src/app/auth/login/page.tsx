'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError, api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { Logo } from '@/components/Logo';

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
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Email ou senha incorretos. Se alterou a senha no EasyPanel, faça rebuild do backend.');
      } else {
        toast.error(humanizeError(err, 'Não foi possível entrar.'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen ge-grid-bg flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm ge-fade-up">
        <div className="flex justify-center mb-6"><Logo size={40} /></div>
        <form onSubmit={onSubmit} className="ge-card p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Entrar</h1>
            <p className="text-sm text-gray-400 mt-1">Acesse seu painel Glee-go ID.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Email</label>
            <input required type="email" className="ge-input w-full px-3 py-2.5" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">Senha</label>
            <input required type="password" className="ge-input w-full px-3 py-2.5" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="ge-btn w-full py-2.5 disabled:opacity-60">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-gray-400">
            Não tem conta?{' '}
            <a href="/auth/register" className="ge-link font-medium hover:underline">Criar grátis</a>
          </p>
        </form>
      </div>
    </main>
  );
}