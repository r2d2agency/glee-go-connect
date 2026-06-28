import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <main className="min-h-screen text-white ge-grid-bg overflow-hidden">
      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <Logo size={34} />
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#recursos" className="hover:text-white">Recursos</a>
          <a href="#como-funciona" className="hover:text-white">Como funciona</a>
          <a href="#planos" className="hover:text-white">Planos</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/auth/login" className="text-sm text-white/80 hover:text-white px-3 py-2">Entrar</Link>
          <Link href="/auth/register" className="ge-btn px-4 py-2 text-sm">Criar grátis</Link>
        </div>
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
            Crie grátis seu <strong className="text-white">link bio inteligente</strong>. Faça upgrade para um cartão ou tag <strong className="text-white">NFC Glee-go ID</strong> e compartilhe seu perfil, contatos e empresa com um toque.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/auth/register" className="ge-btn px-6 py-3 text-base">Criar meu link grátis →</Link>
            <Link href="#planos" className="ge-btn-outline px-6 py-3 text-base">Ver planos</Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50">
            <span>✓ 100% gratuito para começar</span>
            <span>✓ vCard + QR Code</span>
            <span>✓ Captura de leads</span>
            <span>✓ Sem cartão de crédito</span>
          </div>
        </div>

        <div className="relative ge-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(34,211,106,0.25),transparent_60%)] blur-2xl" />
          <div className="relative ge-float">
            <img
              src="/brand/cards.png"
              alt="Cartão Glee-go ID NFC"
              className="rounded-3xl shadow-[0_30px_80px_-20px_rgba(34,211,106,0.35)]"
            />
          </div>
          {/* floating chips */}
          <div className="hidden sm:block absolute -left-4 top-10 ge-card px-3 py-2 text-xs ge-float" style={{ animationDelay: '300ms' }}>
            <span className="text-[var(--ge-green)] font-bold">+ 1</span> novo lead capturado
          </div>
          <div className="hidden sm:block absolute -right-2 bottom-8 ge-card px-3 py-2 text-xs ge-float" style={{ animationDelay: '600ms' }}>
            📱 <span className="text-white/80">Toque NFC detectado</span>
          </div>
        </div>
      </section>

      {/* Logos / social proof */}
      <section className="relative max-w-6xl mx-auto px-5 -mt-6 pb-16">
        <p className="text-center text-[11px] uppercase tracking-[0.25em] text-white/40">Para profissionais, equipes e igrejas</p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-center text-xs text-white/50">
          {['Corretores', 'Consultores', 'Igrejas', 'Clínicas', 'Eventos', 'Equipes'].map((t) => (
            <div key={t} className="ge-card py-3">{t}</div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="relative max-w-6xl mx-auto px-5 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[var(--ge-green)]">Recursos</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Tudo o que você precisa em um único link</h2>
          <p className="mt-3 text-white/60">Do link bio grátis ao cartão NFC com captura de leads e analytics em tempo real.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: '🔗', t: 'Bio Link grátis', d: 'Crie seu link com foto, redes sociais, WhatsApp e botões personalizados.' },
            { i: '💳', t: 'Cartão NFC físico', d: 'Aproxime o cartão de qualquer celular e compartilhe seu perfil em segundos.' },
            { i: '🎨', t: 'Templates personalizáveis', d: 'Escolha entre 6+ templates e personalize cores, fundo e tipografia.' },
            { i: '🏢', t: 'Perfil de empresa', d: 'Adicione logo, áreas de atuação, localização e selo de perfil verificado.' },
            { i: '📇', t: 'vCard + QR Code', d: 'Botão "Salvar contato" gera .vcf compatível com qualquer agenda.' },
            { i: '📊', t: 'Leads e analytics', d: 'Capture leads com UTM, IP e origem. Veja views, cliques e conversões.' },
            { i: '🚀', t: 'Pixel Meta + GA', d: 'Conecte seus pixels para remarketing e mensuração de campanhas.' },
            { i: '🛠️', t: 'Painel admin', d: 'Gestão completa com kanban de produção, envio e ativação dos cartões.' },
            { i: '🔐', t: 'Multiempresa', d: 'Vários cartões por conta, controle de equipe e permissões por usuário.' },
            { i: '🛍️', t: 'Catálogo de produtos', d: 'Mostre produtos com preço, fotos e link de compra direto no seu bio.' },
            { i: '📥', t: 'Conteúdo digital + e-books', d: 'Disponibilize PDFs, e-books e materiais para download com capa personalizada.' },
            { i: '🧲', t: 'Captura com gate de leads', d: 'Libere o catálogo apenas após o lead preencher nome, WhatsApp e e-mail.' },
            { i: '📤', t: 'Exportar leads em Excel', d: 'Baixe seus leads em .xlsx e dispare follow-up direto no WhatsApp.' },
            { i: '🔔', t: 'Webhooks com HMAC', d: 'Integre com whats.gleego.com.br, CRMs e automações com assinatura segura.' },
            { i: '🖼️', t: 'Galeria de fotos', d: 'Upload em lote, lightbox em tela cheia com navegação e proporção 4:5.' },
            { i: '▶️', t: 'Vídeos do YouTube', d: 'Carrossel ilimitado de vídeos com capa automática e player embutido.' },
            { i: '✂️', t: 'Editor de imagem', d: 'Recorte, zoom e rotação no avatar. Escolha bolinha ou quadrado arredondado.' },
            { i: '🌗', t: 'Tema claro e escuro', d: 'Cores totalmente personalizáveis com contraste automático de textos.' },
          ].map((f, i) => (
            <article key={f.t} className="ge-card p-6 ge-fade-up hover:border-[var(--ge-green)]/40 transition-colors" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="text-2xl">{f.i}</div>
              <h3 className="mt-3 text-lg font-bold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-white/65">{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="relative max-w-6xl mx-auto px-5 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[var(--ge-green)]">Como funciona</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Três passos para começar a impressionar</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { n: '01', t: 'Crie sua conta', d: 'Cadastro em 1 minuto com seu nome, WhatsApp, cidade e ramo. Wizard guiado para configurar sua bio.' },
            { n: '02', t: 'Personalize e compartilhe', d: 'Escolha template, cores, foto e links. Receba leads, conecte WhatsApp, e-mail, Instagram e mais.' },
            { n: '03', t: 'Solicite seu NFC', d: 'Faça upgrade direto no painel. Nossa equipe produz, envia e ativa o cartão vinculado à sua conta.' },
          ].map((s, i) => (
            <article key={s.n} className="ge-card p-6 ge-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="text-[var(--ge-green)] font-mono text-sm">{s.n}</span>
              <h3 className="mt-2 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-white/65">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="relative max-w-5xl mx-auto px-5 pb-20">
        <div className="ge-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { k: '10x', v: 'Mais contatos vs papel' },
            { k: '<2s', v: 'Carregamento da página' },
            { k: '100%', v: 'Mobile-first' },
            { k: '∞', v: 'Edições sem reimprimir' },
          ].map((s) => (
            <div key={s.v}>
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--ge-green)]">{s.k}</div>
              <div className="mt-1 text-xs text-white/60">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="relative max-w-5xl mx-auto px-5 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[var(--ge-green)]">Planos</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Comece grátis. Atualize quando quiser.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="ge-card p-8">
            <div className="text-xs uppercase tracking-widest text-white/50">Bio Link</div>
            <div className="mt-2 text-4xl font-extrabold">Grátis</div>
            <p className="mt-2 text-sm text-white/60">Tudo que você precisa para começar online.</p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {['1 link bio personalizado', 'Templates, cores e tema claro/escuro', 'Avatar com recorte + galeria de fotos', 'WhatsApp, Instagram e redes', '1 catálogo (produto ou e-book)', 'Vídeos do YouTube', 'QR Code e vCard', 'Estatísticas básicas'].map((i) => (
                <li key={i} className="flex gap-2"><span className="text-[var(--ge-green)]">✓</span>{i}</li>
              ))}
            </ul>
            <Link href="/auth/register" className="ge-btn-outline inline-block mt-7 px-5 py-2.5 text-sm">Criar grátis</Link>
          </div>
          <div className="ge-card p-8 relative overflow-hidden border-[var(--ge-green)]/40">
            <div className="absolute top-4 right-4 text-[10px] font-bold tracking-widest bg-[var(--ge-green)] text-black px-2 py-1 rounded-full">RECOMENDADO</div>
            <div className="text-xs uppercase tracking-widest text-[var(--ge-green)]">Glee-go ID NFC</div>
            <div className="mt-2 text-4xl font-extrabold">Upgrade</div>
            <p className="mt-2 text-sm text-white/60">Cartão físico NFC + recursos profissionais.</p>
            <ul className="mt-6 space-y-2 text-sm text-white/80">
              {['Tudo do Bio Link', 'Cartão ou tag NFC físico', 'Perfil de empresa + logo', 'Até 5 catálogos (produtos e e-books)', 'Gate de captura de leads', 'Exportação de leads em Excel', 'Webhooks (whats.gleego.com.br, CRMs)', 'Pixel Meta + Google Analytics + UTM', 'Selo de perfil verificado', 'Suporte prioritário'].map((i) => (
                <li key={i} className="flex gap-2"><span className="text-[var(--ge-green)]">✓</span>{i}</li>
              ))}
            </ul>
            <Link href="/auth/register" className="ge-btn inline-block mt-7 px-5 py-2.5 text-sm">Quero meu NFC</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative max-w-3xl mx-auto px-5 pb-24">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[var(--ge-green)]">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Perguntas frequentes</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: 'Preciso comprar o cartão NFC para usar?', a: 'Não. O Bio Link é 100% gratuito. O cartão NFC é um upgrade opcional para quem quer compartilhar com um toque.' },
            { q: 'Como funciona o upgrade para NFC?', a: 'Você solicita pelo painel. Nossa equipe acompanha em um kanban (Aguardando → Produzindo → Enviado → Recebido → Ativado) e vincula o número de série do cartão à sua conta.' },
            { q: 'Posso editar meu link depois de receber o cartão?', a: 'Sim. A URL nunca muda. Você atualiza dados, fotos, cores e links quando quiser, sem reimprimir nada.' },
            { q: 'Funciona em iPhone e Android?', a: 'Sim. A página é 100% responsiva e o botão Salvar contato gera um .vcf compatível com qualquer agenda.' },
            { q: 'Posso ter vários cartões na mesma conta?', a: 'Sim. Cada conta pode ter múltiplos cartões, ideal para equipes, igrejas e empresas.' },
            { q: 'Vocês têm template para igrejas e ministérios?', a: 'Sim. Temos templates pensados para igrejas, ministérios, líderes e empresas de todos os ramos.' },
            { q: 'Posso vender produtos ou entregar e-books pelo meu link?', a: 'Sim. Você cria catálogos com produtos (com preço e link de compra) ou conteúdo digital (PDFs, e-books) com capa personalizada para download.' },
            { q: 'Como funciona a captura de leads?', a: 'No plano PRO você ativa um gate que mostra um formulário (nome, WhatsApp e e-mail) antes de liberar o acesso ao catálogo. Os leads ficam no painel e podem ser exportados em Excel.' },
            { q: 'Dá para integrar com WhatsApp e outras plataformas?', a: 'Sim. Temos webhooks com assinatura HMAC para integração com whats.gleego.com.br, CRMs e automações. Toda nova captura dispara o evento lead.created.' },
            { q: 'Posso colocar vídeos do YouTube?', a: 'Sim. Você adiciona quantos vídeos quiser em um carrossel, com capa automática do YouTube ou personalizada.' },
          ].map((f) => (
            <details key={f.q} className="group ge-card p-5">
              <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                {f.q}
                <span className="ml-4 size-6 rounded-full bg-white/5 grid place-items-center text-[var(--ge-green)] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-white/65 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-5xl mx-auto px-5 pb-24">
        <div className="ge-card p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute -inset-1 bg-[radial-gradient(ellipse_at_center,rgba(34,211,106,0.18),transparent_60%)]" />
          <div className="relative">
            <h3 className="text-3xl sm:text-4xl font-extrabold">Pronto para criar sua <span className="text-[var(--ge-green)]">Glee-go ID</span>?</h3>
            <p className="mt-3 text-white/70">Crie sua conta agora e tenha seu link no ar em menos de 2 minutos.</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/auth/register" className="ge-btn px-7 py-3">Quero meu link grátis</Link>
              <Link href="/auth/login" className="ge-btn-outline px-7 py-3">Já tenho conta</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <Logo size={26} />
          <div className="flex gap-5">
            <a href="#recursos" className="hover:text-white/70">Recursos</a>
            <a href="#planos" className="hover:text-white/70">Planos</a>
            <a href="#faq" className="hover:text-white/70">FAQ</a>
            <Link href="/auth/login" className="hover:text-white/70">Entrar</Link>
          </div>
          <span>© {new Date().getFullYear()} Glee-go ID · Toque e conecte.</span>
        </div>
      </footer>
    </main>
  );
}