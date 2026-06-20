import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Glee-go ID" }, { name: "description", content: "Acesse seu painel Glee-go ID." }] }),
  ssr: false,
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome").max(100),
  company_name: z.string().trim().min(2, "Nome da empresa").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/dashboard", replace: true });
  };

  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.full_name, company_name: parsed.data.company_name },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Conta criada! Entrando...");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 text-white" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-white/10 backdrop-blur border border-white/20 grid place-items-center">
            <Sparkles className="size-5" />
          </div>
          <span className="font-bold text-lg">Glee-go ID</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Seus cartões digitais, no controle.</h2>
          <p className="mt-4 text-white/80 max-w-md">Crie, distribua e meça o desempenho de cada cartão. Multiempresa, mobile-first, pronto para Pixel Meta e UTM.</p>
        </div>
        <div className="text-sm text-white/70">© {new Date().getFullYear()} Glee-go</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden flex items-center gap-2 mb-8">
            <div className="size-9 rounded-xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Glee-go ID</span>
          </Link>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={onLogin} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="li-email">E-mail</Label>
                  <Input id="li-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="li-pwd">Senha</Label>
                  <Input id="li-pwd" name="password" type="password" autoComplete="current-password" required />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading} style={{ background: "var(--gradient-primary)" }}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={onSignup} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Seu nome</Label>
                  <Input id="su-name" name="full_name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-comp">Nome da empresa</Label>
                  <Input id="su-comp" name="company_name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">E-mail</Label>
                  <Input id="su-email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pwd">Senha</Label>
                  <Input id="su-pwd" name="password" type="password" autoComplete="new-password" required minLength={6} />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading} style={{ background: "var(--gradient-primary)" }}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}