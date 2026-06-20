import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ExternalLink, Copy, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cards")({
  ssr: false,
  component: CardsLayout,
});

function CardsLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // If on /cards exactly, show list; otherwise show child route
  if (path === "/cards") return <CardsList />;
  return <Outlet />;
}

function CardsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cards").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Cartão excluído"); qc.invalidateQueries({ queryKey: ["cards"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus cartões</h1>
          <p className="text-muted-foreground">Gerencie todos os cartões digitais da sua empresa.</p>
        </div>
        <Link to="/cards/new"><Button className="gap-2" style={{ background: "var(--gradient-primary)" }}><Plus className="size-4" /> Novo cartão</Button></Link>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Carregando...</div>
      ) : data?.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-16 mx-auto rounded-full bg-secondary grid place-items-center mb-4">
            <QrCode className="size-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">Crie seu primeiro cartão</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Em segundos você terá uma página pública com vCard, QR Code e todos os contatos.</p>
          <Link to="/cards/new" className="inline-block mt-6"><Button style={{ background: "var(--gradient-primary)" }}>Criar cartão</Button></Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((c) => (
            <Card key={c.id} className="p-5 shadow-card hover:shadow-elegant transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.public_name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">/c/{c.slug}</div>
                </div>
                <span className={"text-[10px] px-2 py-0.5 rounded-full shrink-0 " + (c.status === "active" ? "bg-accent/20 text-accent-foreground" : "bg-secondary text-muted-foreground")}>{c.status}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link to="/cards/$id" params={{ id: c.id }}><Button size="sm" variant="outline">Editar</Button></Link>
                <Button size="sm" variant="outline" onClick={() => copyLink(c.slug)}><Copy className="size-3" /></Button>
                <a href={`/c/${c.slug}`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><ExternalLink className="size-3" /></Button></a>
                <Button size="sm" variant="outline" onClick={() => { if (confirm("Excluir este cartão?")) del.mutate(c.id); }}><Trash2 className="size-3" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}