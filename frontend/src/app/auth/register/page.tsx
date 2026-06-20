'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', companyName: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { token } = await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('gleego_token', token);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro ao cadastrar');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-xl border">
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <input className="w-full border rounded px-3 py-2" placeholder="Nome completo" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        <input className="w-full border rounded px-3 py-2" placeholder="Nome da empresa" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border rounded px-3 py-2" placeholder="Senha (mín. 8)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-primary text-white py-2 rounded">Cadastrar</button>
      </form>
    </main>
  );
}