'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { AvatarUploader } from '@/components/AvatarUploader';
import { Logo } from '@/components/Logo';

type Template = { id: string; name: string; description: string; primaryColor: string; dark: boolean };

const TEMPLATES: Template[] = [
  { id: 'minimal', name: 'Minimal', description: 'Limpo e claro.', primaryColor: '#1E40AF', dark: false },
  { id: 'dark', name: 'Dark', description: 'Fundo escuro vibrante.', primaryColor: '#10B981', dark: true },
  { id: 'vibrant', name: 'Vibrant', description: 'Gradiente colorido.', primaryColor: '#EC4899', dark: false },
  { id: 'pro', name: 'Pro', description: 'Sóbrio profissional.', primaryColor: '#0F172A', dark: true },
];

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

function parseJwt(token: string): any {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return {}; }
}

type Link = { label: string; url: string };

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [fullName, setFullName] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [bio, setBio] = useState({ jobTitle: '', bio: '', avatarUrl: '', primaryColor: TEMPLATES[0].primaryColor });
  const [buttons, setButtons] = useState<Link[]>([{ label: '', url: '' }]);
  const [socials, setSocials] = useState<Link[]>([{ label: 'Instagram', url: '' }]);

  const slug = useMemo(() => slugInput || slugify(fullName), [slugInput, fullName]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gleego_token') : null;
    if (!token) { router.replace('/auth/login'); return; }
    const claims = parseJwt(token);
    if (claims?.email && !fullName) {
      setFullName(claims.fullName || claims.name || claims.email.split('@')[0] || '');
    }
    // If user already has cards, skip onboarding
    api('/cards').then((cards) => {
      if (Array.isArray(cards) && cards.length > 0) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [router]);

  function next() {
    if (step === 1) {
      if (!fullName.trim()) return toast.error('Informe seu nome.');
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) return toast.error('Slug inválido. Use letras minúsculas e hífen.');
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function selectTemplate(t: Template) {
    setTemplate(t);
    setBio((b) => ({ ...b, primaryColor: t.primaryColor }));
  }

  async function finish() {
    setLoading(true);
    try {
      await api('/cards', {
        method: 'POST',
        body: JSON.stringify({
          type: 'BIO_LINK',
          slug,
          fullName: fullName.trim(),
          jobTitle: bio.jobTitle || null,
          bio: bio.bio || null,
          avatarUrl: bio.avatarUrl || null,
          primaryColor: bio.primaryColor,
          template: template.id,
          socialLinks: socials.filter((s) => s.label && s.url),
          customButtons: buttons.filter((b) => b.label && b.url),
          active: true,
        }),
      });
      toast.success('Bio link criado! 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error(humanizeError(err, 'Não foi possível concluir a configuração.'));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="min-h-screen grid place-items-center text-gray-400 ge-grid-bg">Carregando...</main>;
  }

  const labels = ['Identificação', 'Template', 'Bio', 'Links'];

  return (
    <main className="min-h-screen ge-grid-bg p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Logo size={32} />
          <button onClick={() => { localStorage.removeItem('gleego_token'); router.push('/auth/login'); }}
            className="text-sm text-gray-300 hover:text-white">Sair</button>
        </header>

        <div className="ge-card border-[var(--ge-green)]/30 text-[var(--ge-green)] text-sm p-3 mb-4">
          ✨ Vamos configurar seu primeiro bio link. Leva menos de 1 minuto.
        </div>

        <ol className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          {labels.map((l, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <li key={l} className="flex items-center gap-2 shrink-0">
                <span className={`size-7 rounded-full grid place-items-center text-xs font-semibold border ${active ? 'bg-[var(--ge-green)] text-[#04130a] border-[var(--ge-green)] ge-pulse' : done ? 'bg-[var(--ge-green-2)] text-white border-[var(--ge-green-2)]' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                  {done ? '✓' : n}
                </span>
                <span className={`text-sm ${active ? 'font-semibold text-white' : 'text-gray-400'}`}>{l}</span>
                {n < 4 && <span className="hidden sm:block w-8 h-px bg-white/10" />}
              </li>
            );
          })}
        </ol>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
          <section className="ge-card p-5 sm:p-7 ge-fade-up">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Como você quer aparecer?</h2>
                  <p className="text-sm text-gray-400">Defina seu nome público e a URL do seu link.</p>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-gray-300">Seu nome público</span>
                  <input className="ge-input w-full px-3 py-2.5" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-gray-300">Seu link público</span>
                  <div className="flex items-center ge-input overflow-hidden p-0">
                    <span className="px-3 py-2.5 bg-white/5 text-gray-400 text-sm border-r border-white/10">bio.gleego.com.br/</span>
                    <input className="flex-1 px-3 py-2.5 min-w-0 bg-transparent text-white outline-none" placeholder="seu-link" value={slugInput}
                      onChange={(e) => setSlugInput(slugify(e.target.value))} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Sugerido: <span className="font-mono text-[var(--ge-green)]">{slug || '...'}</span></p>
                </label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Escolha um template</h2>
                  <p className="text-sm text-gray-400">Você pode mudar depois.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} type="button" onClick={() => selectTemplate(t)}
                      className={`text-left p-4 rounded-xl border-2 transition ${template.id === t.id ? 'border-[var(--ge-green)] ring-2 ring-[var(--ge-green-glow)] bg-white/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}>
                      <div className={`h-20 rounded-lg mb-3 ${t.dark ? 'bg-black/60' : 'bg-white/10'} grid place-items-center`}>
                        <div className="w-10 h-10 rounded-full" style={{ background: t.primaryColor }} />
                      </div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Sua bio</h2>
                  <p className="text-sm text-gray-400">Conte rapidamente o que você faz.</p>
                </div>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-gray-300">Cargo / título</span>
                  <input className="ge-input w-full px-3 py-2.5" placeholder="Ex: Designer · Pastor · Corretor"
                    value={bio.jobTitle} onChange={(e) => setBio({ ...bio, jobTitle: e.target.value })} />
                </label>
                <AvatarUploader
                  value={bio.avatarUrl}
                  onChange={(url) => setBio({ ...bio, avatarUrl: url })}
                  label="Sua foto"
                />
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-gray-300">Bio curta (até 280)</span>
                  <textarea rows={3} maxLength={280} className="ge-input w-full px-3 py-2.5"
                    value={bio.bio} onChange={(e) => setBio({ ...bio, bio: e.target.value })} />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-gray-300">Cor principal</span>
                  <input type="color" className="h-11 w-20 ge-input p-1" value={bio.primaryColor}
                    onChange={(e) => setBio({ ...bio, primaryColor: e.target.value })} />
                </label>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Seus links</h2>
                  <p className="text-sm text-gray-400">Adicione botões e redes sociais (pode pular).</p>
                </div>
                <LinkList title="Botões" items={buttons} onChange={setButtons} labelPh="Ex: Meu site" max={5} />
                <LinkList title="Redes sociais" items={socials} onChange={setSocials} labelPh="Ex: Instagram" max={5} />
              </div>
            )}

            <div className="grid grid-cols-[auto_1fr] sm:flex sm:justify-between gap-3 mt-8">
              <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || loading}
                className="px-4 py-2.5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40">Voltar</button>
              {step < 4 ? (
                <button type="button" onClick={next} className="ge-btn px-5 py-2.5 text-sm">
                  Continuar
                </button>
              ) : (
                <button type="button" disabled={loading} onClick={finish} className="ge-btn px-5 py-2.5 text-sm disabled:opacity-60">
                  {loading ? 'Publicando...' : 'Publicar meu bio link'}
                </button>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 self-start">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2 px-1">Pré-visualização</p>
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${template.dark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900'}`}>
              <div className="h-20" style={{ background: bio.primaryColor }} />
              <div className="px-5 pb-6 -mt-10 text-center">
                <div className="size-20 mx-auto rounded-full border-4 border-white shadow bg-slate-200 overflow-hidden">
                  {bio.avatarUrl ? <img src={bio.avatarUrl} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <h3 className="font-bold mt-3 truncate">{fullName || 'Seu nome'}</h3>
                {bio.jobTitle && <p className={`text-sm ${template.dark ? 'text-slate-300' : 'text-slate-500'}`}>{bio.jobTitle}</p>}
                {bio.bio && <p className={`text-sm mt-2 ${template.dark ? 'text-slate-300' : 'text-slate-600'}`}>{bio.bio}</p>}
                <p className={`text-xs mt-2 ${template.dark ? 'text-slate-400' : 'text-slate-400'}`}>bio.gleego.com.br/{slug || 'seu-link'}</p>
                <div className="mt-4 space-y-2">
                  {buttons.filter((b) => b.label).slice(0, 5).map((b, i) => (
                    <div key={i} className="py-2.5 rounded-lg text-sm font-medium truncate" style={{ background: bio.primaryColor, color: '#fff' }}>
                      {b.label}
                    </div>
                  ))}
                </div>
                {socials.some((s) => s.label) && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {socials.filter((s) => s.label).map((s, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full ${template.dark ? 'bg-white/10' : 'bg-slate-100'}`}>{s.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function LinkList({ title, items, onChange, labelPh, max }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-white">{title}</h3>
        <button type="button" onClick={() => items.length < max && onChange([...items, { label: '', url: '' }])}
          className="text-xs ge-link hover:underline disabled:opacity-50" disabled={items.length >= max}>
          + Adicionar
        </button>
      </div>
      {items.map((item: Link, i: number) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className="ge-input px-3 py-2 text-sm min-w-0" placeholder={labelPh} value={item.label}
            onChange={(e) => { const c = [...items]; c[i] = { ...c[i], label: e.target.value }; onChange(c); }} />
          <input className="ge-input px-3 py-2 text-sm min-w-0" placeholder="https://" value={item.url}
            onChange={(e) => { const c = [...items]; c[i] = { ...c[i], url: e.target.value }; onChange(c); }} />
          <button type="button" onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            className="px-2 text-gray-500 hover:text-red-400">×</button>
        </div>
      ))}
    </div>
  );
}