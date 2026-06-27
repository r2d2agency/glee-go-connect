type Props = { params: { slug: string } };
type Link = { label: string; url: string };

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

  const type = card.type || 'BIO_LINK';
  const primary = card.primaryColor || '#1E40AF';
  const buttons: Link[] = Array.isArray(card.customButtons) ? card.customButtons : [];
  const socials: Link[] = Array.isArray(card.socialLinks) ? card.socialLinks : [];
  const dark = card.template === 'dark' || card.template === 'pro';

  if (type === 'DIGITAL_CARD') {
    return (
      <main className="min-h-screen flex flex-col items-center p-6" style={{ background: primary, color: '#fff' }}>
        <div className="w-full max-w-md">
          {card.avatarUrl && (
            <img src={card.avatarUrl} alt="" className="size-28 rounded-full mx-auto border-4 border-white/30 object-cover" />
          )}
          <h1 className="text-3xl font-bold text-center mt-4">{card.fullName}</h1>
          {card.jobTitle && <p className="opacity-80 text-center">{card.jobTitle}</p>}
          {card.bio && <p className="mt-4 text-center opacity-90">{card.bio}</p>}

          <div className="mt-6 grid gap-2">
            {card.whatsapp && <a className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 text-center font-medium" href={`https://wa.me/${card.whatsapp}`}>WhatsApp</a>}
            {card.phone && <a className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 text-center" href={`tel:${card.phone}`}>Ligar {card.phone}</a>}
            {card.email && <a className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 text-center" href={`mailto:${card.email}`}>{card.email}</a>}
            {card.website && <a className="bg-white/10 hover:bg-white/20 rounded-lg px-4 py-3 text-center" href={card.website} target="_blank" rel="noreferrer">Site</a>}
            <a className="bg-white text-slate-900 rounded-lg px-4 py-3 text-center font-semibold mt-2"
               href={`/api/vcard/${card.slug}`}>Salvar contato (vCard)</a>
          </div>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full">{s.label}</a>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // BIO_LINK
  return (
    <main className={`min-h-screen px-4 py-10 ${dark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full max-w-md mx-auto text-center">
        {card.avatarUrl ? (
          <img src={card.avatarUrl} alt={card.fullName} className="size-24 mx-auto rounded-full object-cover border-4 border-white shadow" />
        ) : (
          <div className="size-24 mx-auto rounded-full bg-slate-200" />
        )}
        <h1 className="text-2xl font-bold mt-4 truncate">{card.fullName}</h1>
        {card.jobTitle && <p className={dark ? 'text-slate-300' : 'text-slate-500'}>{card.jobTitle}</p>}
        {card.bio && <p className={`mt-3 text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{card.bio}</p>}

        <div className="mt-6 space-y-2.5">
          {buttons.filter((b) => b.label && b.url).map((b, i) => (
            <a key={i} href={b.url} target="_blank" rel="noreferrer"
               className="block py-3 rounded-xl font-medium shadow-sm hover:opacity-90 transition"
               style={{ background: primary, color: '#fff' }}>{b.label}</a>
          ))}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp}`} className="block py-3 rounded-xl font-medium shadow-sm hover:opacity-90 transition"
               style={{ background: primary, color: '#fff' }}>WhatsApp</a>
          )}
        </div>

        {socials.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {socials.filter((s) => s.label && s.url).map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer"
                 className={`text-xs px-3 py-1.5 rounded-full ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-white border hover:bg-slate-100'}`}>
                {s.label}
              </a>
            ))}
          </div>
        )}

        <p className={`mt-10 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Criado com <a href="/" className="font-semibold hover:underline">Glee-go ID</a>
        </p>
      </div>
    </main>
  );
}