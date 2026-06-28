'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { AvatarUploader } from '@/components/AvatarUploader';
import { FileUploader } from '@/components/FileUploader';
import { GalleryMultiUploader } from '@/components/GalleryMultiUploader';

type Link = { label: string; url: string; icon?: string };
type Product = {
  photo?: string;
  title: string;
  description?: string;
  price?: string;
  link?: string;
  category?: string;
  kind?: 'product' | 'digital';
  fileUrl?: string;
  fileName?: string;
};
type Service = { icon?: string; title: string; description?: string };
type Template = {
  id: string; name: string; description: string;
  primaryColor: string; accentColor: string; bgColor: string; dark: boolean;
};

export default function EditCardPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [card, setCard] = useState<any>(null);
  const [tab, setTab] = useState<'perfil' | 'links' | 'catalogo' | 'galeria' | 'banner' | 'servicos' | 'visual' | 'seo'>('perfil');

  useEffect(() => {
    const token = localStorage.getItem('gleego_token');
    if (!token) { router.push('/auth/login'); return; }
    Promise.all([api(`/cards/${id}`), api('/templates')])
      .then(([c, t]) => { setCard(c); setTemplates(t); })
      .catch((e) => toast.error(humanizeError(e)))
      .finally(() => setLoading(false));
  }, [id, router]);

  function set<K extends string>(key: K, value: any) {
    setCard((c: any) => ({ ...c, [key]: value }));
  }

  function applyTemplate(t: Template) {
    setCard((c: any) => ({
      ...c,
      template: t.id,
      primaryColor: t.primaryColor,
      accentColor: t.accentColor,
      bgColor: t.bgColor,
    }));
  }

  function updateList(field: 'customButtons' | 'socialLinks', idx: number, patch: Partial<Link>) {
    setCard((c: any) => {
      const arr: Link[] = Array.isArray(c[field]) ? [...c[field]] : [];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...c, [field]: arr };
    });
  }
  function addItem(field: 'customButtons' | 'socialLinks') {
    setCard((c: any) => ({ ...c, [field]: [...(c[field] ?? []), { label: '', url: '' }] }));
  }
  function removeItem(field: 'customButtons' | 'socialLinks', idx: number) {
    setCard((c: any) => ({ ...c, [field]: (c[field] ?? []).filter((_: any, i: number) => i !== idx) }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        fullName: card.fullName,
        jobTitle: card.jobTitle,
        bio: card.bio,
        phone: card.phone,
        whatsapp: card.whatsapp,
        email: card.email,
        website: card.website,
        avatarUrl: card.avatarUrl,
        avatarShape: card.avatarShape ?? 'circle',
        companyName: card.companyName,
        companyLogoUrl: card.companyLogoUrl,
        location: card.location,
        tagline: card.tagline,
        verified: !!card.verified,
        areas: card.areas ?? [],
        template: card.template,
        primaryColor: card.primaryColor,
        accentColor: card.accentColor,
        bgColor: card.bgColor,
        customButtons: card.customButtons ?? [],
        socialLinks: card.socialLinks ?? [],
        bannerUrl: card.bannerUrl ?? '',
        bannerCtaLabel: card.bannerCtaLabel ?? '',
        bannerCtaUrl: card.bannerCtaUrl ?? '',
        categories: card.categories ?? [],
        products: (card.products ?? []).slice(0, 10),
        gallery: card.gallery ?? [],
        services: card.services ?? [],
        videos: card.videos ?? [],
        servicesCtaLabel: card.servicesCtaLabel ?? '',
        servicesCtaUrl: card.servicesCtaUrl ?? '',
        catalogLeadGate: !!card.catalogLeadGate,
      };
      await api(`/cards/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      toast.success('Cartão salvo!');
    } catch (e) {
      toast.error(humanizeError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !card) return <main className="min-h-screen grid place-items-center text-white/50">Carregando...</main>;

  const buttons: Link[] = card.customButtons ?? [];
  const socials: Link[] = card.socialLinks ?? [];
  const areas: { label: string; icon?: string }[] = card.areas ?? [];
  const categories: string[] = Array.isArray(card.categories) ? card.categories : [];
  const products: Product[] = Array.isArray(card.products) ? card.products : [];
  const gallery: string[] = Array.isArray(card.gallery) ? card.gallery : [];
  const services: Service[] = Array.isArray(card.services) ? card.services : [];
  const videos: { url: string; cover?: string; title?: string }[] =
    Array.isArray(card.videos) ? card.videos : [];
  const plan: string = card?.company?.plan || 'FREE';
  const productLimit = plan === 'BUSINESS' ? 10 : plan === 'PRO' ? 5 : 50;

  const TABS: { id: typeof tab; label: string }[] = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'links', label: 'Links' },
    { id: 'banner', label: 'Banner' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'galeria', label: 'Galeria' },
    { id: 'visual', label: 'Visual' },
    { id: 'seo', label: 'SEO & Tracking' },
  ];

  function updateProduct(i: number, patch: Partial<Product>) {
    const arr = [...products];
    arr[i] = { ...arr[i], ...patch };
    set('products', arr);
  }

  return (
    <main className="min-h-screen bg-[var(--ge-bg)] text-white [&_input]:bg-[var(--ge-surface-2)] [&_textarea]:bg-[var(--ge-surface-2)] [&_select]:bg-[var(--ge-surface-2)] [&_input]:text-white [&_textarea]:text-white [&_select]:text-white [&_input]:border-white/10 [&_textarea]:border-white/10 [&_select]:border-white/10 [&_input]:placeholder-white/40 [&_textarea]:placeholder-white/40">
      <header className="bg-[var(--ge-surface)] border-b border-white/5 sticky top-0 z-10 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-sm text-white/60 hover:text-white">← Voltar</button>
          <h1 className="font-semibold truncate flex-1">Editar: {card.fullName}</h1>
          <a href={`https://bio.gleego.com.br/${card.slug}`} target="_blank" className="text-sm text-[var(--ge-green)] hover:underline">Ver público</a>
          <button onClick={save} disabled={saving} className="ge-btn px-4 py-2 rounded-lg text-sm disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <nav className="bg-[var(--ge-surface)] border-b border-white/5 sticky top-[57px] z-10 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-[var(--ge-green)] text-[var(--ge-green)] font-semibold' : 'border-transparent text-white/60 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {tab === 'visual' && (<>
          <section className="ge-card border-white/10 p-4 sm:p-6">
            <h2 className="font-semibold mb-3">Template</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {templates.map((t) => (
                <button key={t.id} type="button" onClick={() => applyTemplate(t)}
                  className={`text-left rounded-xl p-3 border-2 transition ${card.template === t.id ? 'border-[var(--ge-green)]' : 'border-transparent hover:border-white/20'}`}
                  style={{ background: t.bgColor, color: t.dark ? '#fff' : '#0F172A' }}>
                  <div className="flex gap-1 mb-2">
                    <span className="size-4 rounded-full" style={{ background: t.primaryColor }} />
                    <span className="size-4 rounded-full" style={{ background: t.accentColor }} />
                  </div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-[11px] opacity-70">{t.description}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="ge-card border-white/10 p-4 sm:p-6">
            <h2 className="font-semibold mb-3">Personalizar cores</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'primaryColor', label: 'Primária' },
                { key: 'accentColor', label: 'Destaque' },
                { key: 'bgColor', label: 'Fundo' },
              ].map((f) => (
                <label key={f.key} className="block">
                  <span className="text-xs text-white/60 block mb-1">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" className="size-10 rounded border cursor-pointer"
                      value={card[f.key] ?? '#000000'}
                      onChange={(e) => set(f.key, e.target.value)} />
                    <input type="text" className="flex-1 border rounded px-2 py-1.5 text-sm font-mono"
                      value={card[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)} />
                  </div>
                </label>
              ))}
            </div>
          </section>
          </>)}

          {tab === 'perfil' && (<>
          <section className="ge-card border-white/10 p-4 sm:p-6 grid sm:grid-cols-2 gap-3">
            <h2 className="font-semibold sm:col-span-2">Informações</h2>
            <input className="border rounded px-3 py-2" placeholder="Nome completo" value={card.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Cargo" value={card.jobTitle ?? ''} onChange={(e) => set('jobTitle', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="WhatsApp" value={card.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Telefone" value={card.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Email" value={card.email ?? ''} onChange={(e) => set('email', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Website" value={card.website ?? ''} onChange={(e) => set('website', e.target.value)} />
            <div className="sm:col-span-2">
              <AvatarUploader
                value={card.avatarUrl}
                onChange={(url) => set('avatarUrl', url)}
                label="Foto de perfil"
                shape={card.avatarShape === 'rounded' ? 'rounded' : 'circle'}
              />
              <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                <span>Formato:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="avatarShape"
                    checked={(card.avatarShape ?? 'circle') === 'circle'}
                    onChange={() => set('avatarShape', 'circle')}
                  />
                  ⚪ Círculo
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="avatarShape"
                    checked={card.avatarShape === 'rounded'}
                    onChange={() => set('avatarShape', 'rounded')}
                  />
                  ▢ Quadrado arredondado
                </label>
              </div>
            </div>
            <textarea rows={3} className="border rounded px-3 py-2 sm:col-span-2" placeholder="Bio" value={card.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
          </section>

          <section className="ge-card border-white/10 p-4 sm:p-6 grid sm:grid-cols-2 gap-3">
            <h2 className="font-semibold sm:col-span-2">Empresa (opcional)</h2>
            <input className="border rounded px-3 py-2" placeholder="Nome da empresa" value={card.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Localização (cidade/UF ou endereço)" value={card.location ?? ''} onChange={(e) => set('location', e.target.value)} />
            <input className="border rounded px-3 py-2 sm:col-span-2" placeholder="Frase de apresentação (tagline)" value={card.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
            <div className="sm:col-span-2">
              <AvatarUploader
                value={card.companyLogoUrl}
                onChange={(url) => set('companyLogoUrl', url)}
                label="Logo da empresa"
                size={72}
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!card.verified} onChange={(e) => set('verified', e.target.checked)} />
              Mostrar selo verificado ao lado do nome
            </label>
          </section>

          <section className="ge-card border-white/10 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Áreas de atuação</h2>
              <button onClick={() => set('areas', [...areas, { label: '', icon: 'lightbulb' }])} className="text-sm text-[var(--ge-green)] hover:underline">+ Adicionar</button>
            </div>
            <div className="space-y-2">
              {areas.length === 0 && <p className="text-sm text-white/50">Nenhuma área. Ex: Iluminação, Consultoria...</p>}
              {areas.map((a, i) => (
                <div key={i} className="border rounded-lg p-2 grid grid-cols-[1fr_140px_auto] gap-2">
                  <input className="border rounded px-2 py-1.5 text-sm" placeholder="Rótulo" value={a.label as string}
                    onChange={(e) => { const c: any[] = [...areas]; c[i] = { ...c[i], label: e.target.value }; set('areas', c); }} />
                  <select className="border rounded px-2 py-1.5 text-sm" value={(a.icon as string) || 'lightbulb'}
                    onChange={(e) => { const c: any[] = [...areas]; c[i] = { ...c[i], icon: e.target.value }; set('areas', c); }}>
                    {['lightbulb','bars','users','cube','target','gear','briefcase','chat'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <button onClick={() => set('areas', areas.filter((_, j) => j !== i))} className="text-red-600 text-sm px-2">×</button>
                  <input className="col-span-3 border rounded px-2 py-1.5 text-sm" placeholder="Descrição curta (opcional)"
                    value={(a as any).description ?? ''}
                    onChange={(e) => { const c: any[] = [...areas]; c[i] = { ...c[i], description: e.target.value }; set('areas', c); }} />
                </div>
              ))}
            </div>
          </section>
          </>)}

          {tab === 'links' && (<>
          <section className="ge-card border-white/10 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Redes sociais</h2>
              <button onClick={() => addItem('socialLinks')} className="text-sm text-[var(--ge-green)] hover:underline">+ Adicionar</button>
            </div>
            <div className="space-y-2">
              {socials.length === 0 && <p className="text-sm text-white/50">Nenhuma rede adicionada.</p>}
              {socials.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input className="border rounded px-2 py-1.5 text-sm" placeholder="Nome (Instagram)" value={s.label} onChange={(e) => updateList('socialLinks', i, { label: e.target.value })} />
                  <input className="border rounded px-2 py-1.5 text-sm" placeholder="URL" value={s.url} onChange={(e) => updateList('socialLinks', i, { url: e.target.value })} />
                  <button onClick={() => removeItem('socialLinks', i)} className="text-red-600 text-sm px-2">×</button>
                </div>
              ))}
            </div>
          </section>

          <section className="ge-card border-white/10 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Botões/Links</h2>
              <button onClick={() => addItem('customButtons')} className="text-sm text-[var(--ge-green)] hover:underline">+ Adicionar</button>
            </div>
            <div className="space-y-2">
              {buttons.length === 0 && <p className="text-sm text-white/50">Nenhum botão.</p>}
              {buttons.map((b, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input className="border rounded px-2 py-1.5 text-sm" placeholder="Rótulo" value={b.label} onChange={(e) => updateList('customButtons', i, { label: e.target.value })} />
                  <input className="border rounded px-2 py-1.5 text-sm" placeholder="URL" value={b.url} onChange={(e) => updateList('customButtons', i, { url: e.target.value })} />
                  <button onClick={() => removeItem('customButtons', i)} className="text-red-600 text-sm px-2">×</button>
                </div>
              ))}
            </div>
          </section>
          </>)}

          {tab === 'banner' && (
            <section className="ge-card border-white/10 p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Banner do topo</h2>
                <p className="text-sm text-white/50">Imagem grande no topo da sua página com botão de ação.</p>
              </div>
              <AvatarUploader value={card.bannerUrl} onChange={(url) => set('bannerUrl', url)} label="Imagem do banner (1600×600 recomendado)" size={120} />
              <div className="grid sm:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Texto do botão (ex: Fale comigo)" value={card.bannerCtaLabel ?? ''} onChange={(e) => set('bannerCtaLabel', e.target.value)} />
                <input className="border rounded px-3 py-2" placeholder="Link do botão (https://...)" value={card.bannerCtaUrl ?? ''} onChange={(e) => set('bannerCtaUrl', e.target.value)} />
              </div>
              {card.bannerUrl && (
                <button onClick={() => { set('bannerUrl', ''); set('bannerCtaLabel', ''); set('bannerCtaUrl', ''); }} className="text-sm text-red-600 hover:underline">Remover banner</button>
              )}
            </section>
          )}

          {tab === 'servicos' && (
            <section className="ge-card border-white/10 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h2 className="font-semibold">Como posso te ajudar</h2>
                  <p className="text-xs text-white/50">Grade de serviços/diferenciais com ícone, título e descrição.</p>
                </div>
                <button onClick={() => set('services', [...services, { icon: 'briefcase', title: '', description: '' }])}
                  className="text-sm text-[var(--ge-green)] hover:underline">+ Adicionar</button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {services.length === 0 && <p className="text-sm text-white/50 sm:col-span-2">Ex: Consultoria Jurídica, Elaboração de Contratos...</p>}
                {services.map((s, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-3 space-y-2 bg-[var(--ge-surface-2)]">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-white/50">Serviço #{i + 1}</span>
                      <button onClick={() => set('services', services.filter((_, j) => j !== i))} className="text-red-600 text-sm">Remover</button>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] gap-2">
                      <select className="border rounded px-2 py-1.5 text-sm bg-[var(--ge-surface-2)]" value={s.icon || 'briefcase'}
                        onChange={(e) => { const c = [...services]; c[i] = { ...c[i], icon: e.target.value }; set('services', c); }}>
                        {['lightbulb','bars','users','cube','target','gear','briefcase','chat','user','website','phone','email'].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input className="border rounded px-2 py-1.5 text-sm" placeholder="Título" value={s.title}
                        onChange={(e) => { const c = [...services]; c[i] = { ...c[i], title: e.target.value }; set('services', c); }} />
                    </div>
                    <textarea rows={2} className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Descrição curta"
                      value={s.description ?? ''}
                      onChange={(e) => { const c = [...services]; c[i] = { ...c[i], description: e.target.value }; set('services', c); }} />
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t pt-4 grid sm:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2" placeholder="Texto do botão (ex: Falar com a advogada)"
                  value={card.servicesCtaLabel ?? ''} onChange={(e) => set('servicesCtaLabel', e.target.value)} />
                <input className="border rounded px-3 py-2" placeholder="Link do botão (WhatsApp, formulário...)"
                  value={card.servicesCtaUrl ?? ''} onChange={(e) => set('servicesCtaUrl', e.target.value)} />
              </div>
            </section>
          )}

          {tab === 'catalogo' && (<>
            <section className="ge-card border-white/10 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold">Categorias</h2>
                  <p className="text-xs text-white/50">Agrupe seus produtos. Aparecem como filtros na página pública.</p>
                </div>
                <button onClick={() => set('categories', [...categories, ''])} className="text-sm text-[var(--ge-green)] hover:underline">+ Adicionar</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 && <p className="text-sm text-white/50">Ex: Promoções, Lançamentos, Serviços...</p>}
                {categories.map((c, i) => (
                  <div key={i} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1">
                    <input className="bg-transparent text-sm outline-none w-32" placeholder="Nome" value={c}
                      onChange={(e) => { const arr = [...categories]; arr[i] = e.target.value; set('categories', arr); }} />
                    <button onClick={() => set('categories', categories.filter((_, j) => j !== i))} className="size-6 grid place-items-center rounded-full hover:bg-white/10 text-white/50">×</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="ge-card border-white/10 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold">Catálogo de produtos</h2>
                  <p className="text-xs text-white/50">
                    {products.length}/{productLimit} itens — plano <b>{plan}</b>
                    {plan === 'FREE' && ' (faça upgrade para Pro: 5 itens)'}
                  </p>
                </div>
                <button disabled={products.length >= productLimit}
                  onClick={() => set('products', [...products, { kind: 'product', title: '', description: '', price: '', link: '', photo: '', category: '' }])}
                  className="text-sm text-[var(--ge-green)] hover:underline disabled:opacity-40 disabled:no-underline">+ Adicionar item</button>
              </div>
              <div className="mb-4 flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[.03]">
                <input id="leadgate" type="checkbox" className="mt-1 size-4 accent-[var(--ge-green)]"
                  checked={!!card.catalogLeadGate}
                  onChange={(e) => set('catalogLeadGate', e.target.checked)} />
                <label htmlFor="leadgate" className="text-sm">
                  <div className="font-semibold text-white">Captura de leads no catálogo</div>
                  <div className="text-xs text-white/60">Quando ativo, o visitante precisa preencher nome, WhatsApp e e-mail para liberar o catálogo. Os contatos aparecem em <b>Leads</b>.</div>
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {products.length === 0 && <p className="text-sm text-white/50 md:col-span-2">Nenhum produto. Adicione até {productLimit} {productLimit === 1 ? 'item' : 'itens'}.</p>}
                {products.map((p, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-3 space-y-2 bg-[var(--ge-surface-2)]">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-white/50">Item #{i + 1}</span>
                      <button onClick={() => set('products', products.filter((_, j) => j !== i))} className="text-red-600 text-sm">Remover</button>
                    </div>
                    <div className="flex gap-1 p-1 rounded-lg bg-black/30 border border-white/10 text-xs">
                      {([
                        { id: 'product', label: '🛍 Produto / Serviço' },
                        { id: 'digital', label: '⬇ Conteúdo digital' },
                      ] as const).map((opt) => {
                        const active = (p.kind || 'product') === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateProduct(i, { kind: opt.id })}
                            className={`flex-1 px-2 py-1.5 rounded-md transition ${active ? 'bg-[var(--ge-green)] text-black font-semibold' : 'text-white/60 hover:text-white'}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <AvatarUploader value={p.photo} onChange={(url) => updateProduct(i, { photo: url })} label={(p.kind === 'digital' ? 'Capa do conteúdo' : 'Foto do produto')} size={80} />
                    <input className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Título" value={p.title}
                      onChange={(e) => updateProduct(i, { title: e.target.value })} />
                    <textarea rows={2} className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Descrição curta"
                      value={p.description ?? ''} onChange={(e) => updateProduct(i, { description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border rounded px-2 py-1.5 text-sm" placeholder={p.kind === 'digital' ? 'Preço (ou "Grátis")' : 'Preço (ex: R$ 99,90)'}
                        value={p.price ?? ''} onChange={(e) => updateProduct(i, { price: e.target.value })} />
                      <select className="border rounded px-2 py-1.5 text-sm bg-[var(--ge-surface-2)]" value={p.category ?? ''}
                        onChange={(e) => updateProduct(i, { category: e.target.value })}>
                        <option value="">Sem categoria</option>
                        {categories.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {p.kind === 'digital' ? (
                      <FileUploader
                        value={p.fileUrl}
                        fileName={p.fileName}
                        label="Arquivo do e-book / conteúdo (PDF, EPUB, ZIP, MP3...)"
                        onChange={(d) => updateProduct(i, { fileUrl: d?.url || '', fileName: d?.fileName || '' })}
                      />
                    ) : (
                      <input className="border rounded px-2 py-1.5 text-sm w-full" placeholder="Link (WhatsApp, site, etc.)"
                        value={p.link ?? ''} onChange={(e) => updateProduct(i, { link: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>)}

          {tab === 'galeria' && (
            <section className="ge-card border-white/10 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold">Galeria de fotos</h2>
                  <p className="text-xs text-white/50">Suba fotos do seu trabalho, produtos, ambiente.</p>
                </div>
              </div>
              <div className="mb-4">
                <GalleryMultiUploader onUploaded={(urls) => set('gallery', [...gallery, ...urls])} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.length === 0 && <p className="text-sm text-white/50 col-span-full">Nenhuma foto enviada.</p>}
                {gallery.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => set('gallery', gallery.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Remover</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'galeria' && (
            <section className="ge-card border-white/10 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold">Vídeos do YouTube</h2>
                  <p className="text-xs text-white/50">Cole o link do YouTube. A capa é puxada automaticamente; envie uma personalizada se quiser.</p>
                </div>
                <button
                  onClick={() => set('videos', [...videos, { url: '', cover: '', title: '' }])}
                  className="text-sm text-[var(--ge-green)] hover:underline"
                >+ Adicionar vídeo</button>
              </div>
              <div className="space-y-3">
                {videos.length === 0 && (
                  <p className="text-sm text-white/50">Nenhum vídeo adicionado. Aceita youtube.com/watch?v=… , youtu.be/… ou /shorts/…</p>
                )}
                {videos.map((v, i) => (
                  <div key={i} className="border border-white/10 rounded-xl p-3 bg-[var(--ge-surface-2)] flex flex-col sm:flex-row gap-3 items-start">
                    <div className="shrink-0">
                      <AvatarUploader
                        value={v.cover}
                        onChange={(url) => { const arr = [...videos]; arr[i] = { ...arr[i], cover: url }; set('videos', arr); }}
                        label="Capa (opcional)"
                        size={96}
                        shape="rounded"
                      />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0 w-full">
                      <input
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Link do YouTube"
                        value={v.url}
                        onChange={(e) => { const arr = [...videos]; arr[i] = { ...arr[i], url: e.target.value }; set('videos', arr); }}
                      />
                      <input
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Título (opcional)"
                        value={v.title ?? ''}
                        onChange={(e) => { const arr = [...videos]; arr[i] = { ...arr[i], title: e.target.value }; set('videos', arr); }}
                      />
                    </div>
                    <button
                      onClick={() => set('videos', videos.filter((_, j) => j !== i))}
                      className="text-red-500 text-sm self-start shrink-0"
                    >Remover</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'seo' && (
            <section className="ge-card border-white/10 p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="font-semibold">SEO & Tracking</h2>
                <p className="text-xs text-white/50">Otimize sua página para buscadores e conecte pixels de rastreamento.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="text-white/70 text-xs">Título SEO</span>
                  <input className="mt-1 w-full rounded-lg px-3 py-2" value={card.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Seu Nome — Profissão" />
                </label>
                <label className="block text-sm">
                  <span className="text-white/70 text-xs">Descrição SEO</span>
                  <input className="mt-1 w-full rounded-lg px-3 py-2" value={card.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} placeholder="Resumo curto exibido no Google e em redes sociais" />
                </label>
                <label className="block text-sm">
                  <span className="text-white/70 text-xs">Meta Pixel ID</span>
                  <input className="mt-1 w-full rounded-lg px-3 py-2" value={card.metaPixelId ?? ''} onChange={(e) => set('metaPixelId', e.target.value)} placeholder="123456789012345" />
                </label>
                <label className="block text-sm">
                  <span className="text-white/70 text-xs">Google Analytics 4 (GA ID)</span>
                  <input className="mt-1 w-full rounded-lg px-3 py-2" value={card.gaId ?? ''} onChange={(e) => set('gaId', e.target.value)} placeholder="G-XXXXXXXXXX" />
                </label>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                <p className="font-semibold text-white/80 mb-1">UTM</p>
                <p>Sua página pública aceita parâmetros <code className="text-[var(--ge-green)]">?utm_source</code>, <code className="text-[var(--ge-green)]">utm_medium</code>, <code className="text-[var(--ge-green)]">utm_campaign</code>, <code>utm_term</code> e <code>utm_content</code>. Eles são automaticamente registrados nas visualizações e aparecem no seu dashboard de Analytics.</p>
                <p className="mt-2">Ex: <code className="text-white/80">https://bio.gleego.com.br/{card.slug}?utm_source=instagram&utm_campaign=lancamento</code></p>
              </div>
            </section>
          )}
        </div>

        {/* Preview */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="rounded-3xl p-5 text-center" style={{ background: card.bgColor || '#0A0F1F', color: '#fff', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className={`size-20 mx-auto ${card.avatarShape === 'rounded' ? 'rounded-2xl' : 'rounded-full'} p-[3px]`} style={{ background: `linear-gradient(135deg, ${card.primaryColor || '#2563EB'}, ${card.accentColor || '#3B82F6'})` }}>
              {card.avatarUrl
                ? <img src={card.avatarUrl} className={`size-full ${card.avatarShape === 'rounded' ? 'rounded-[14px]' : 'rounded-full'} object-contain bg-black/40`} style={{ objectPosition: 'center' }} alt="" />
                : <div className={`size-full ${card.avatarShape === 'rounded' ? 'rounded-[14px]' : 'rounded-full'} bg-black/30`} />}
            </div>
            <h3 className="font-bold mt-3">{card.fullName || 'Seu nome'}</h3>
            {card.jobTitle && <p className="text-xs opacity-70">{card.jobTitle}</p>}
            <div className="mt-4 py-2 rounded-lg text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${card.primaryColor}, ${card.accentColor})` }}>
              Salvar contato
            </div>
            <div className="mt-2 space-y-1.5">
              {buttons.slice(0, 3).filter(b => b.label).map((b, i) => (
                <div key={i} className="text-xs py-2 rounded-lg truncate" style={{ background: 'rgba(255,255,255,.06)' }}>{b.label}</div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50 text-center mt-3">Pré-visualização</p>
        </aside>
      </div>
    </main>
  );
}