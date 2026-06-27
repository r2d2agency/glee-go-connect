import { PublicCardView } from './view';

type Props = { params: { slug: string } };

async function getCard(slug: string) {
  const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
  const res = await fetch(`${API}/api/public/cards/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props) {
  const card = await getCard(params.slug);
  if (!card) return { title: 'Cartão não encontrado' };
  return {
    title: card.seoTitle || `${card.fullName} — Glee-go ID`,
    description: card.seoDescription || card.bio || `${card.fullName} no Glee-go ID`,
    openGraph: { images: card.avatarUrl ? [card.avatarUrl] : [] },
  };
}

export default async function PublicCard({ params }: Props) {
  const card = await getCard(params.slug);
  if (!card) {
    return (
      <main className="min-h-screen grid place-items-center p-6 bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Página não encontrada</h1>
          <p className="text-slate-500 mt-2">Verifique o link e tente novamente.</p>
        </div>
      </main>
    );
  }
  const vcardUrl = `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '')}/api/vcard/${card.slug}`;
  return <PublicCardView card={card} vcardUrl={vcardUrl} />;
}