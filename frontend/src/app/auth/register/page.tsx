'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { humanizeError } from '@/lib/errors';
import { BR_STATES, INDUSTRIES, SOURCES } from '@/lib/br-options';
import { Logo } from '@/components/Logo';
import { AvatarUploader } from '@/components/AvatarUploader';

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

type Link = { label: string; url: string; type?: string };

const QUICK_BUTTONS = [
  { type: 'site', label: 'Site', placeholder: 'https://seusite.com.br', prefix: '' },
  { type: 'email', label: 'Email', placeholder: 'voce@email.com', prefix: 'mailto:' },
  { type: 'whatsapp', label: 'WhatsApp', placeholder: '5511999999999', prefix: 'https://wa.me/' },
  { type: 'phone', label: 'Telefone', placeholder: '+55 11 99999-9999', prefix: 'tel:' },
  { type: 'maps', label: 'Localização', placeholder: 'https://maps.google.com/...', prefix: '' },
];

const QUICK_SOCIALS = [
  { type: 'instagram', label: 'Instagram', placeholder: '@seuuser', prefix: 'https://instagram.com/' },
  { type: 'facebook', label: 'Facebook', placeholder: 'sua.pagina', prefix: 'https://facebook.com/' },
  { type: 'linkedin', label: 'LinkedIn', placeholder: 'seu-perfil', prefix: 'https://linkedin.com/in/' },
  { type: 'youtube', label: 'YouTube', placeholder: '@canal', prefix: 'https://youtube.com/' },
  { type: 'tiktok', label: 'TikTok', placeholder: '@seuuser', prefix: 'https://tiktok.com/@' },
  { type: 'x', label: 'X / Twitter', placeholder: '@seuuser', prefix: 'https://x.com/' },
];

export default function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    slug: '',
    whatsapp: '',
    city: '',
    state: '',
    industry: '',
    source: '',
  });
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [bio, setBio] = useState({
    jobTitle: '',
    bio: '',
    avatarUrl: '',
    primaryColor: TEMPLATES[0].primaryColor,
    companyName: '',
    companyLogoUrl: '',
  });
  const [buttons, setButtons] = useState<Link[]>([]);
  const [socials, setSocials] = useState<Link[]>([]);
  const [accountCreated, setAccountCreated] = useState(false);

  const slug = useMemo(() => account.slug || slugify(account.fullName), [account.slug, account.fullName]);

  function selectTemplate(t: Template) {
    setTemplate(t);
    setBio((b) => ({ ...b, primaryColor: t.primaryColor }));
  }

  async function next() {
    if (step === 1) {
      if (!account.fullName.trim()) return toast.error('Informe seu nome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(account.email)) return toast.error('Email inválido.');
      if (account.password.length < 6) return toast.error('Senha precisa ter no mínimo 6 caracteres.');
      if (account.password !== account.confirmPassword) return toast.error('As senhas não conferem.');
      if (!account.whatsapp.trim()) return toast.error('Informe seu WhatsApp.');
      if (!account.city.trim()) return toast.error('Informe sua cidade.');
      if (!account.state) return toast.error('Selecione seu estado.');
      if (!account.industry) return toast.error('Selecione seu ramo de atividade.');
      if (!account.source) return toast.error('Conte como nos conheceu.');
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) return toast.error('Slug inválido. Use letras minúsculas e hífen.');
      if (!accountCreated) {
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
          setAccountCreated(true);
          toast.success('Conta criada! Agora personalize sua bio.');
        } catch (err) {
          const msg = humanizeError(err, 'Não foi possível criar a conta.');
          if (/já cadastrado/i.test(msg)) {
            toast.error('Esse email já tem conta. Faça login para continuar.');
          } else {
            toast.error(msg);
          }
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    }
    setStep((s) => Math.min(4, s + 1));
  }

  async function finish() {
    setLoading(true);
    try {
      await api('/cards', {
        method: 'POST',
        body: JSON.stringify({
          type: 'BIO_LINK',
          slug,
          fullName: account.fullName.trim(),
          jobTitle: bio.jobTitle || null,
          bio: bio.bio || null,
          avatarUrl: bio.avatarUrl || null,
          companyName: bio.companyName || null,
          companyLogoUrl: bio.companyLogoUrl || null,
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
      const msg = humanizeError(err, 'Não foi possível concluir o cadastro.');
      if (/já cadastrado/i.test(msg) || /already/i.test(msg)) {
        toast.error('Esse email já tem conta. Faça login para continuar.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen ge-grid-bg p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Logo size={32} />
          <a href="/auth/login" className="text-sm text-gray-300 hover:text-white">Já tenho conta</a>
        </header>

        <Steps step={step} />

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-6">
          <section className="ge-card p-5 sm:p-7 ge-fade-up">
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
                className="px-4 py-2.5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 disabled:opacity-40"
              >
                Voltar
              </button>
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
            <span className={`size-7 rounded-full grid place-items-center text-xs font-semibold border ${active ? 'bg-[var(--ge-green)] text-[#04130a] border-[var(--ge-green)] ge-pulse' : done ? 'bg-[var(--ge-green-2)] text-white border-[var(--ge-green-2)]' : 'bg-white/5 text-gray-400 border-white/10'}`}>
              {done ? '✓' : n}
            </span>
            <span className={`text-sm ${active ? 'font-semibold text-white' : 'text-gray-400'}`}>{l}</span>
            {n < 4 && <span className="hidden sm:block w-8 h-px bg-white/10" />}
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
        <h2 className="text-xl font-bold text-white">Crie sua conta</h2>
        <p className="text-sm text-gray-400">É grátis e leva menos de 1 minuto.</p>
      </div>
      <Field label="Seu nome">
        <input className="ge-input w-full px-3 py-2.5" value={value.fullName} onChange={(e) => onChange({ ...value, fullName: e.target.value })} />
      </Field>
      <Field label="Email">
        <input type="email" className="ge-input w-full px-3 py-2.5" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} />
      </Field>
      <Field label="Senha (mín. 6)">
        <PasswordInput value={value.password} onChange={(password) => onChange({ ...value, password })} />
      </Field>
      <Field label="Confirmar senha">
        <PasswordInput value={value.confirmPassword} onChange={(confirmPassword) => onChange({ ...value, confirmPassword })} />
      </Field>
      <Field label="WhatsApp">
        <input inputMode="tel" placeholder="(11) 99999-9999" className="ge-input w-full px-3 py-2.5"
          value={value.whatsapp} onChange={(e) => onChange({ ...value, whatsapp: e.target.value })} />
      </Field>
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <Field label="Cidade">
          <input className="ge-input w-full px-3 py-2.5" value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })} />
        </Field>
        <Field label="Estado (UF)">
          <select className="ge-input w-full px-3 py-2.5" value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}>
            <option value="">UF</option>
            {BR_STATES.map((s) => (
              <option key={s.uf} value={s.uf}>{s.uf} — {s.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Ramo de atividade">
        <select className="ge-input w-full px-3 py-2.5" value={value.industry}
          onChange={(e) => onChange({ ...value, industry: e.target.value })}>
          <option value="">Selecione...</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>
      <Field label="Como nos conheceu?">
        <select className="ge-input w-full px-3 py-2.5" value={value.source}
          onChange={(e) => onChange({ ...value, source: e.target.value })}>
          <option value="">Selecione...</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Seu link público">
        <div className="flex items-center ge-input overflow-hidden p-0">
          <span className="px-3 py-2.5 bg-white/5 text-gray-400 text-sm border-r border-white/10">bio.gleego.com.br/</span>
          <input className="flex-1 px-3 py-2.5 min-w-0 bg-transparent text-white outline-none" placeholder="seu-link" value={value.slug} onChange={(e) => onChange({ ...value, slug: slugify(e.target.value) })} />
        </div>
        <p className="text-xs text-gray-400 mt-1">Sugerido: <span className="font-mono text-[var(--ge-green)]">{slug || '...'}</span></p>
      </Field>
    </div>
  );
}

function Step2({ templates, selected, onSelect }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Escolha um template</h2>
        <p className="text-sm text-gray-400">Você pode mudar a qualquer momento.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map((t: Template) => (
          <button key={t.id} type="button" onClick={() => onSelect(t)}
            className={`text-left p-4 rounded-xl border-2 transition ${selected.id === t.id ? 'border-[var(--ge-green)] ring-2 ring-[var(--ge-green-glow)] bg-white/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}>
            <div className={`h-20 rounded-lg mb-3 ${t.dark ? 'bg-black/60' : 'bg-white/10'} grid place-items-center`}>
              <div className="w-10 h-10 rounded-full" style={{ background: t.primaryColor }} />
            </div>
            <div className="font-semibold text-white">{t.name}</div>
            <div className="text-xs text-gray-400">{t.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3({ value, onChange }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Sua bio</h2>
        <p className="text-sm text-gray-400">Conte rapidamente o que você faz e envie sua foto.</p>
      </div>

      <div className="ge-card p-4 bg-white/[0.02]">
        <AvatarUploader
          value={value.avatarUrl}
          onChange={(url) => onChange({ ...value, avatarUrl: url })}
          label="Foto de perfil"
          size={88}
        />
      </div>

      <Field label="Cargo / título">
        <input className="ge-input w-full px-3 py-2.5" placeholder="Ex: Designer · Pastor · Corretor"
          value={value.jobTitle} onChange={(e) => onChange({ ...value, jobTitle: e.target.value })} />
      </Field>
      <Field label="Bio curta (até 280)">
        <textarea rows={3} maxLength={280} className="ge-input w-full px-3 py-2.5"
          value={value.bio} onChange={(e) => onChange({ ...value, bio: e.target.value })} />
      </Field>
      <Field label="Cor principal">
        <input type="color" className="h-11 w-20 ge-input p-1" value={value.primaryColor}
          onChange={(e) => onChange({ ...value, primaryColor: e.target.value })} />
      </Field>

      <div className="pt-4 border-t border-white/10 space-y-4">
        <div>
          <h3 className="font-semibold text-white">Empresa (opcional)</h3>
          <p className="text-xs text-gray-400">Mostre o nome e a logo da empresa onde você trabalha.</p>
        </div>
        <Field label="Nome da empresa">
          <input className="ge-input w-full px-3 py-2.5" placeholder="Ex: Gleego Tech"
            value={value.companyName} onChange={(e) => onChange({ ...value, companyName: e.target.value })} />
        </Field>
        <div className="ge-card p-4 bg-white/[0.02]">
          <AvatarUploader
            value={value.companyLogoUrl}
            onChange={(url) => onChange({ ...value, companyLogoUrl: url })}
            label="Logo da empresa"
            size={72}
          />
        </div>
      </div>
    </div>
  );
}

function Step4({ buttons, setButtons, socials, setSocials }: any) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white">Seus links</h2>
        <p className="text-sm text-gray-400">Clique para adicionar — preencha só os que quiser.</p>
      </div>

      <QuickList
        title="Botões de contato"
        items={buttons}
        onChange={setButtons}
        presets={QUICK_BUTTONS}
        max={6}
      />
      <QuickList
        title="Redes sociais"
        items={socials}
        onChange={setSocials}
        presets={QUICK_SOCIALS}
        max={8}
      />
    </div>
  );
}

function QuickList({ title, items, onChange, presets, max }: {
  title: string; items: Link[]; onChange: (l: Link[]) => void;
  presets: { type: string; label: string; placeholder: string; prefix: string }[]; max: number;
}) {
  function add(p: { type: string; label: string; prefix: string }) {
    if (items.length >= max) return;
    if (items.some((i) => i.type === p.type)) return;
    onChange([...items, { type: p.type, label: p.label, url: p.prefix }]);
  }
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const added = items.some((i) => i.type === p.type);
          return (
            <button
              key={p.type}
              type="button"
              onClick={() => add(p)}
              disabled={added}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                added
                  ? 'border-[var(--ge-green)] bg-[var(--ge-green)]/10 text-[var(--ge-green)]'
                  : 'border-white/15 text-gray-300 hover:border-[var(--ge-green)] hover:text-white'
              }`}
            >
              {added ? '✓ ' : '+ '}{p.label}
            </button>
          );
        })}
      </div>
      {items.length === 0 && (
        <p className="text-xs text-gray-500">Nenhum {title.toLowerCase()} ainda. Clique acima para adicionar.</p>
      )}
      <div className="space-y-2">
        {items.map((item, i) => {
          const preset = presets.find((p) => p.type === item.type);
          return (
            <div key={i} className="grid grid-cols-[110px_1fr_auto] gap-2 items-center">
              <span className="text-xs text-gray-300 px-2 py-2 bg-white/5 rounded-md border border-white/10 truncate">
                {item.label}
              </span>
              <input
                className="ge-input px-3 py-2 text-sm min-w-0"
                placeholder={preset?.placeholder || 'https://'}
                value={item.url}
                onChange={(e) => {
                  const c = [...items];
                  c[i] = { ...c[i], url: e.target.value };
                  onChange(c);
                }}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="px-2 text-gray-500 hover:text-red-400"
                aria-label="Remover"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
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

function Field({ label, children }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function PasswordInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className="ge-input w-full px-3 py-2.5 pr-12"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white"
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
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
        <p className={`text-xs mt-2 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>bio.gleego.com.br/{slug}</p>
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