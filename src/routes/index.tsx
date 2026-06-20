import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, QrCode, Zap, BarChart3, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glee-go ID — Cartões digitais NFC e QR Code" },
      { name: "description", content: "Crie cartões digitais com vCard, captura de leads, analytics e SEO. Plataforma SaaS multiempresa pronta para escalar." },
      { property: "og:title", content: "Glee-go ID — Cartões digitais NFC e QR" },
      { property: "og:description", content: "Cartões digitais NFC/QR com micro landing page, vCard, leads e analytics." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="absolute top-0 inset-x-0 z-20">
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="size-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Glee-go ID</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-primary hover:bg-white/90">Criar conta</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden pt-32 pb-24 px-6"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm text-white mb-6">
            <span className="size-1.5 rounded-full bg-accent-glow animate-pulse" />
            Novo: Pixel Meta + UTM por campanha
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Seu cartão de visitas,<br />
            <span className="bg-gradient-to-r from-accent-glow to-white bg-clip-text text-transparent">
              agora digital.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Cartões NFC/QR com micro landing page, vCard, captura de leads e analytics em tempo real. Multiempresa, multiequipe, pronto pra escalar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow gap-2 h-12 px-7">
                Começar grátis <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/c/demo">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20 hover:text-white h-12 px-7">
                Ver demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Tudo que sua equipe precisa</h2>
            <p className="mt-3 text-muted-foreground text-lg">Do cartão básico ao plano Pro com automação completa.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Smartphone, title: "Página mobile-first", desc: "Micro landing page rápida, otimizada e personalizável por template." },
              { icon: QrCode, title: "QR Code + NFC", desc: "Gere o QR e grave a URL única no seu cartão NFC físico." },
              { icon: Zap, title: "vCard nativo", desc: "Botão Salvar contato gera .vcf com todos os dados pra agenda do celular." },
              { icon: Users, title: "Captura de leads", desc: "Formulário com UTM, IP e origem direto no seu painel." },
              { icon: BarChart3, title: "Analytics em tempo real", desc: "Views, cliques, downloads e taxa de conversão por cartão." },
              { icon: Sparkles, title: "SEO + Pixel Meta", desc: "Title, description, OG, GTM, GA e Pixel Meta no plano Pro." },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant transition-all hover:-translate-y-1">
                <div className="size-12 rounded-xl grid place-items-center mb-4 group-hover:scale-110 transition-transform" style={{ background: "var(--gradient-primary)" }}>
                  <f.icon className="size-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-24 px-6 bg-secondary/40">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Planos simples</h2>
            <p className="mt-3 text-muted-foreground text-lg">Comece com o cartão. Escale com o Pro.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
              <div className="text-sm font-medium text-muted-foreground">Glee-go ID Card</div>
              <div className="mt-2 text-4xl font-bold">Cartão único</div>
              <p className="mt-3 text-sm text-muted-foreground">Página digital simples com vCard, QR e redes sociais.</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Templates básicos", "vCard + QR Code", "Redes sociais", "Estatísticas básicas"].map((i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{i}</li>
                ))}
              </ul>
            </div>
            <div className="relative rounded-3xl border-2 border-primary bg-card p-8 shadow-elegant overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-medium bg-accent text-accent-foreground px-2.5 py-1 rounded-full">Recomendado</div>
              <div className="text-sm font-medium text-primary">Glee-go ID Pro</div>
              <div className="mt-2 text-4xl font-bold">Assinatura</div>
              <p className="mt-3 text-sm text-muted-foreground">Tudo do Card + leads, UTM, Pixel, GTM e SEO completo.</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {["Formulário de captura de leads", "UTM personalizada por campanha", "Pixel Meta + GA + GTM", "SEO da página + OG", "Vídeos e botões ilimitados", "Analytics avançado"].map((i) => (
                  <li key={i} className="flex gap-2"><span className="text-accent">✓</span>{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold">Pronto pra digitalizar seus cartões?</h2>
          <p className="mt-3 text-muted-foreground text-lg">Crie sua conta e tenha seu primeiro cartão no ar em minutos.</p>
          <Link to="/auth" className="inline-block mt-8">
            <Button size="lg" className="h-12 px-8 gap-2" style={{ background: "var(--gradient-primary)" }}>
              Criar conta grátis <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Glee-go ID · Powered by Glee-go
      </footer>
    </div>
  );
}
