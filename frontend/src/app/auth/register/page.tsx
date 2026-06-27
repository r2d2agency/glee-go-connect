'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { BR_STATES, INDUSTRIES, SOURCES } from '@/lib/br-options';

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

type Link = { label: string; url: string };

export default function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState({
    fullName: '',
    email: '',
    password: '',
    slug: '',
    whatsapp: '',
    city: '',
    state: '',
    industry: '',
    source: '',
  });
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [bio, setBio] = useState({ jobTitle: '', bio: '', avatarUrl: '', primaryColor: TEMPLATES[0].primaryColor });
  const [buttons, setButtons] = useState<Link[]>([{ label: '', url: '' }]);
  const [socials, setSocials] = useState<Link[]>([{ label: 'Instagram', url: '' }]);

  const slug = useMemo(() => account.slug || slugify(account.fullName), [account.slug, account.fullName]);

  function selectTemplate(t: Template) {
    setTemplate(t);
    setBio((b) => ({ ...b, primaryColor: t.primaryColor }));
  }

  function next() {
    if (step === 1) {
      if (!account.fullName.trim()) return toast.error('Informe seu nome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(account.email)) return toast.error('Email inválido.');
      if (account.password.length < 6) return toast.error('Senha precisa ter no mínimo 6 caracteres.');
      if (!account.whatsapp.trim()) return toast.error('Informe seu WhatsApp.');
      if (!account.city.trim()) return toast.error('Informe sua cidade.');
      if (!account.state) return toast.error('Selecione seu estado.');
      if (!account.industry) return toast.error('Selecione seu ramo de atividade.');
      if (!account.source) return toast.error('Conte como nos conheceu.');
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) return toast.error('Slug inválido. Use letras minúsculas e hífen.');
    }
    setStep((s) => Math.min(4, s + 1));
  }

  async function finish() {
    setLoading(true);
    try {
      const { token } = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: account.fullName.trim(),
          email: account.email.trim().toLowerCase(),
          password: account.password,
          companyName: account.fullName.trim(),
          whatsapp: account.whatsapp.trim(),
          city: account.city.trim(),
          state: account.state,
          industry: account.industry,
          source: account.source,
        }),
      });
      localStorage.setItem('gleego_token', token);
      await api('/cards', {
        method: 'POST',
        body: JSON.stringify({
          type: 'BIO_LINK',
          slug,
          fullName: account.fullName.trim(),
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
      toast.error(humanizeError(err, 'Não foi possível concluir o cadastro.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <a href="/" className="font-bold text-blue-900">Glee-go ID</a>
          <a href="/auth/login" className="text-sm text-slate-600 hover:underline">Já tenho conta</a>
        </header>

        <Steps step={step} />

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
          <section className="bg-white border rounded-2xl p-5 sm:p-7 shadow-sm">
            {step === 1 && (
              <Step1
                value={account}
                onChange={setAccount}
                slug={slug}
              />
            )}
            {step === 2 && (
              <Step2 templates={TEMPLATES} selected={template} onSelect={selectTemplate} />
            )}
            {step === 3 && (
              <Step3 value={bio} onChange={setBio} />
            )}
            {step === 4 && (
              <Step4 buttons={buttons} setButtons={setButtons} socials={socials} setSocials={setSocials} />
            )}

            <div className="grid grid-cols-[auto_1fr] sm:flex sm:justify-between gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1 || loading}
                className="px-4 py-2.5 border rounded-lg text-sm disabled:opacity-40"
              >
                Voltar
              </button>
              {step < 4 ? (
                <button type="button" onClick={next} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                  Continuar
                </button>
              ) : (
                <button type="button" disabled={loading} onClick={finish} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                  {loading ? 'Publicando...' : 'Publicar meu bio link'}
                </button>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 self-start">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2 px-1">Pré-visualização</p>
            <Preview
              template={template}
              fullName={account.fullName || 'Seu nome'}
              slug={slug || 'seu-link'}
              jobTitle={bio.jobTitle}
              bio={bio.bio}
              avatarUrl={bio.avatarUrl}
              primaryColor={bio.primaryColor}
              buttons={buttons}
              socials={socials}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ['Conta', 'Template', 'Bio', 'Links'];
  return (
    <ol className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
      {labels.map((l, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={l} className="flex items-center gap-2 shrink-0">
            <span className={`size-7 rounded-full grid place-items-center text-xs font-semibold border ${active ? 'bg-blue-700 text-white border-blue-700' : done ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500'}`}>
              {done ? '✓' : n}
            </span>
            <span className={`text-sm ${active ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{l}</span>
            {n < 4 && <span className="hidden sm:block w-8 h-px bg-slate-300" />}
          </li>
        );
      })}
    </ol>
  );
}

function Step1({ value, onChange, slug }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Crie sua conta</h2>
        <p className="text-sm text-slate-500">É grátis e leva menos de 1 minuto.</p>
      </div>
      <Field label="Seu nome">
        <input className="w-full border rounded-lg px-3 py-2.5" value={value.fullName} onChange={(e) => onChange({ ...value, fullName: e.target.value })} />
      </Field>
      <Field label="Email">
        <input type="email" className="w-full border rounded-lg px-3 py-2.5" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </Field>
      <Field label="Senha (mín. 6)">
        <input type="password" className="w-full border rounded-lg px-3 py-2.5" value={value.password} onChange={(e) => onChange({ ...value, password: e.target.value })} />
      </Field>
      <Field label="WhatsApp">
        <input inputMode="tel" placeholder="(11) 99999-9999" className="w-full border rounded-lg px-3 py-2.5"
          value={value.whatsapp} onChange={(e) => onChange({ ...value, whatsapp: e.target.value })} />
      </Field>
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <Field label="Cidade">
          <input className="w-full border rounded-lg px-3 py-2.5" value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })} />
        </Field>
        <Field label="Estado (UF)">
          <select className="w-full border rounded-lg px-3 py-2.5 bg-white" value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}>
            <option value="">UF</option>
            {BR_STATES.map((s) => (
              <option key={s.uf} value={s.uf}>{s.uf} — {s.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Ramo de atividade">
        <select className="w-full border rounded-lg px-3 py-2.5 bg-white" value={value.industry}
          onChange={(e) => onChange({ ...value, industry: e.target.value })}>
          <option value="">Selecione...</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="Como nos conheceu?">
        <select className="w-full border rounded-lg px-3 py-2.5 bg-white" value={value.source}
          onChange={(e) => onChange({ ...value, source: e.target.value })}>
          <option value="">Selecione...</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Seu link público">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <span className="px-3 py-2.5 bg-slate-50 text-slate-500 text-sm border-r">glee.go/c/</span>
          <input className="flex-1 px-3 py-2.5 min-w-0" placeholder="seu-link" value={value.slug} onChange={(e) => onChange({ ...value, slug: slugify(e.target.value) })} />
        </div>
        <p className="text-xs text-slate-500 mt-1">Sugerido: <span className="font-mono">{slug || '...'}</span></p>
      </Field>
    </div>
  );
}

function Step2({ templates, selected, onSelect }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Escolha um template</h2>
        <p className="text-sm text-slate-500">Você pode mudar a qualquer momento.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((t: Template) => (
          <button key={t.id} type="button" onClick={() => onSelect(t)}
            className={`text-left p-4 rounded-xl border-2 transition ${selected.id === t.id ? 'border-blue-700 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className={`h-20 rounded-lg mb-3 ${t.dark ? 'bg-slate-900' : 'bg-slate-100'} grid place-items-center`}>
              <div className="w-10 h-10 rounded-full" style={{ background: t.primaryColor }} />
            </div>
            <div className="font-semibold">{t.name}</div>
            <div className="text-xs text-slate-500">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({ value, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Sua bio</h2>
        <p className="text-sm text-slate-500">Conte rapidamente o que você faz.</p>
      </div>
      <Field label="Cargo / título">
        <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Ex: Designer · Pastor · Corretor"
          value={value.jobTitle} onChange={(e) => onChange({ ...value, jobTitle: e.target.value })} />
      </Field>
      <Field label="Foto (URL)">
        <input className="w-full border rounded-lg px-3 py-2.5" placeholder="https://..."
          value={value.avatarUrl} onChange={(e) => onChange({ ...value, avatarUrl: e.target.value })} />
      </Field>
      <Field label="Bio curta (até 280)">
        <textarea rows={3} maxLength={280} className="w-full border rounded-lg px-3 py-2.5"
          value={value.bio} onChange={(e) => onChange({ ...value, bio: e.target.value })} />
      </Field>
      <Field label="Cor principal">
        <input type="color" className="h-11 w-20 border rounded-lg" value={value.primaryColor}
          onChange={(e) => onChange({ ...value, primaryColor: e.target.value })} />
      </Field>
    </div>
  );
}

function Step4({ buttons, setButtons, socials, setSocials }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Seus links</h2>
        <p className="text-sm text-slate-500">Adicione botões e redes sociais (pode pular).</p>
      </div>
      <LinkList title="Botões" items={buttons} onChange={setButtons} labelPh="Ex: Meu site" max={5} />
      <LinkList title="Redes sociais" items={socials} onChange={setSocials} labelPh="Ex: Instagram" max={5} />
    </div>
  );
}

function LinkList({ title, items, onChange, labelPh, max }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <button type="button" onClick={() => items.length < max && onChange([...items, { label: '', url: '' }])}
          className="text-xs text-blue-700 hover:underline disabled:opacity-50" disabled={items.length >= max}>
          + Adicionar
        </button>
      </div>
      {items.map((item: Link, i: number) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input className="border rounded-lg px-3 py-2 text-sm min-w-0" placeholder={labelPh} value={item.label}
            onChange={(e) => { const c = [...items]; c[i] = { ...c[i], label: e.target.value }; onChange(c); }} />
          <input className="border rounded-lg px-3 py-2 text-sm min-w-0" placeholder="https://" value={item.url}
            onChange={(e) => { const c = [...items]; c[i] = { ...c[i], url: e.target.value }; onChange(c); }} />
          <button type="button" onClick={() => onChange(items.filter((_: any, j: number) => j !== i))}
            className="px-2 text-slate-400 hover:text-red-600">×</button>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Preview({ template, fullName, slug, jobTitle, bio, avatarUrl, primaryColor, buttons, socials }: any) {
  const dark = template.dark;
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900'}`}>
      <div className="h-20" style={{ background: primaryColor }} />
      <div className="px-5 pb-6 -mt-10 text-center">
        <div className="size-20 mx-auto rounded-full border-4 border-white shadow bg-slate-200 overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : null}
        </div>
        <h3 className="font-bold mt-3 truncate">{fullName}</h3>
        {jobTitle && <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{jobTitle}</p>}
        {bio && <p className={`text-sm mt-2 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{bio}</p>}
        <p className={`text-xs mt-2 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>glee.go/c/{slug}</p>
        <div className="mt-4 space-y-2">
          {buttons.filter((b: Link) => b.label).slice(0, 5).map((b: Link, i: number) => (
            <div key={i} className="py-2.5 rounded-lg text-sm font-medium truncate" style={{ background: primaryColor, color: '#fff' }}>
              {b.label}
            </div>
          ))}
        </div>
        {socials.some((s: Link) => s.label) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {socials.filter((s: Link) => s.label).map((s: Link, i: number) => (
              <span key={i} className={`text-xs px-2 py-1 rounded-full ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>{s.label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}