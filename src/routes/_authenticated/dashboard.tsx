import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Eye, Users, MousePointerClick, Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [cards, events, leads] = await Promise.all([
        supabase.from("cards").select("id,name,slug,status,template", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
        supabase.from("analytics_events").select("event_type", { count: "exact", head: false }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
      ]);
      const views = (events.data || []).filter((e) => e.event_type === "view").length;
      const clicks = (events.data || []).filter((e) => e.event_type !== "view").length;
      return {
        cards: cards.data || [],
        cardsCount: cards.count || 0,
        views,
        clicks,
        leadsCount: leads.count || 0,
      };
    },
  });

  const stats = [
    { label: "Cartões", value: data?.cardsCount ?? 0, icon: CreditCard },
    { label: "Visualizações", value: data?.views ?? 0, icon: Eye },
    { label: "Cliques", value: data?.clicks ?? 0, icon: MousePointerClick },
    { label: "Leads", value: data?.leadsCount ?? 0, icon: Users },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos seus cartões digitais.</p>
        </div>
        <Link to="/cards/new"><Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="size-4" /> Novo cartão</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <s.icon className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-3xl font-bold">{isLoading ? "—" : s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Cartões recentes</h2>
          <Link to="/cards" className="text-sm text-primary inline-flex items-center gap-1">Ver todos <ArrowRight className="size-3" /></Link>
        </div>
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Carregando...</div>
        ) : data?.cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="size-16 mx-auto rounded-full bg-secondary grid place-items-center mb-4">
              <CreditCard className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">Nenhum cartão ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro cartão digital em segundos.</p>
            <Link to="/cards/new" className="inline-block mt-4"><Button>Criar cartão</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data?.cards.map((c) => (
              <Link key={c.id} to="/cards/$id" params={{ id: c.id }} className="flex items-center justify-between py-3 hover:bg-secondary/50 -mx-3 px-3 rounded-lg transition-colors">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">/c/{c.slug} · {c.template}</div>
                </div>
                <span className={"text-xs px-2 py-0.5 rounded-full " + (c.status === "active" ? "bg-accent/20 text-accent-foreground" : "bg-secondary text-muted-foreground")}>{c.status}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}