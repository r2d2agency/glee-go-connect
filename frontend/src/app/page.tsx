import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen text-white ge-grid-bg overflow-hidden">
      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <Logo size={34} />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/login" className="text-sm text-white/80 hover:text-white px-3 py-2">Entrar</Link>
          <Link href="/auth/register" className="ge-btn px-4 py-2 text-sm">Criar grátis</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-5 pt-10 sm:pt-16 pb-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="ge-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(34,211,106,0.12)] text-[var(--ge-green)] border border-[rgba(34,211,106,0.25)]">
            <span className="size-1.5 rounded-full bg-[var(--ge-green)] ge-pulse" /> Toque · Conecte · Converta
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Sua identidade digital com <span className="text-[var(--ge-green)]">um único toque.</span>
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-xl">
            Crie grátis seu link bio inteligente. Faça upgrade para um cartão ou tag <strong className="text-white">NFC Glee-go ID</strong> e compartilhe seu perfil com elegância.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/auth/register" className="ge-btn px-6 py-3 text-base">Criar meu link grátis →</Link>
            <Link href="/auth/login" className="ge-btn-outline px-6 py-3 text-base">Já tenho conta</Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-white/50">
            <span>✓ 100% gratuito para começar</span>
            <span>✓ vCard + QR Code</span>
            <span>✓ Captura de leads</span>
          </div>
        </div>

        <div className="relative ge-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(34,211,106,0.25),transparent_60%)] blur-2xl" />
          <div className="relative ge-float">
            <Image
              src="/brand/cards.png"
              alt="Cartão Glee-go ID NFC"
              width={1200}
              height={900}
              className="rounded-3xl shadow-[0_30px_80px_-20px_rgba(34,211,106,0.35)]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="relative max-w-6xl mx-auto px-5 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Como funciona</h2>
        <p className="text-center text-white/60 mt-2">Três passos para começar a impressionar</p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { n: '01', t: 'Crie sua conta', d: 'Cadastro rápido, sem cartão de crédito. Personalize cores e fotos.' },
            { n: '02', t: 'Compartilhe seu link', d: 'Receba leads, conecte redes sociais, WhatsApp, e-mail e mais.' },
            { n: '03', t: 'Faça upgrade NFC', d: 'Solicite seu cartão físico Glee-go ID e conecte com um toque.' },
          ].map((s, i) => (
            <article key={s.n} className="ge-card p-6 ge-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-[var(--ge-green)] font-mono text-sm">{s.n}</span>
              <h3 className="mt-2 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-white/65">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-5xl mx-auto px-5 pb-24">
        <div className="ge-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -inset-1 bg-[radial-gradient(ellipse_at_center,rgba(34,211,106,0.18),transparent_60%)]" />
          <div className="relative">
            <h3 className="text-3xl sm:text-4xl font-extrabold">Pronto para criar sua <span className="text-[var(--ge-green)]">Glee-go ID</span>?</h3>
            <p className="mt-3 text-white/70">Comece grátis. Atualize quando quiser.</p>
            <Link href="/auth/register" className="ge-btn inline-block mt-6 px-7 py-3">Quero meu link grátis</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Glee-go ID · Toque e conecte.
      </footer>
    </main>
  );
}