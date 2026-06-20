'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [cards, setCards] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/cards').then(setCards).catch(() => setError('Faça login novamente'));
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Meus cartões</h1>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="space-y-2">
        {cards.map(c => (
          <li key={c.id} className="p-4 border rounded">{c.fullName} — /{c.slug}</li>
        ))}
      </ul>
    </main>
  );
}