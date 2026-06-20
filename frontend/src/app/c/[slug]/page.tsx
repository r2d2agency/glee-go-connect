type Props = { params: { slug: string } };

async function getCard(slug: string) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API}/api/public/cards/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicCard({ params }: Props) {
  const card = await getCard(params.slug);
  if (!card) return <main className="p-8">Cartão não encontrado</main>;

  return (
    <main className="min-h-screen flex flex-col items-center p-8" style={{ background: card.primaryColor ?? '#0F172A', color: '#fff' }}>
      <h1 className="text-3xl font-bold">{card.fullName}</h1>
      {card.jobTitle && <p className="opacity-80">{card.jobTitle}</p>}
      {card.bio && <p className="mt-4 max-w-md text-center">{card.bio}</p>}
      <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
        {card.phone && <a className="bg-white/10 rounded px-4 py-2" href={`tel:${card.phone}`}>Ligar</a>}
        {card.whatsapp && <a className="bg-white/10 rounded px-4 py-2" href={`https://wa.me/${card.whatsapp}`}>WhatsApp</a>}
        {card.email && <a className="bg-white/10 rounded px-4 py-2" href={`mailto:${card.email}`}>Email</a>}
        {card.website && <a className="bg-white/10 rounded px-4 py-2" href={card.website}>Website</a>}
      </div>
    </main>
  );
}