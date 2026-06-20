import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardForm, emptyCardForm, type CardFormValues } from "@/components/card-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { randomSlug, slugify } from "@/lib/vcard";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/cards/new")({
  ssr: false,
  component: NewCard,
});

function NewCard() {
  const navigate = useNavigate();
  const [initial] = useState<CardFormValues>(() => ({
    ...emptyCardForm,
    slug: randomSlug(),
  }));

  const create = useMutation({
    mutationFn: async (v: CardFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
      if (!profile?.company_id) throw new Error("Empresa não encontrada");
      const slug = v.slug ? slugify(v.slug) : randomSlug();
      const { data, error } = await supabase.from("cards").insert({
        ...v,
        slug,
        company_id: profile.company_id,
        owner_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Cartão criado!");
      navigate({ to: "/cards/$id", params: { id: data.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <Link to="/cards"><Button variant="ghost" size="sm" className="gap-1 mb-4"><ArrowLeft className="size-4" /> Voltar</Button></Link>
      <h1 className="text-3xl font-bold tracking-tight mb-1">Novo cartão</h1>
      <p className="text-muted-foreground mb-8">Preencha as informações para criar seu cartão digital.</p>
      <CardForm initial={initial} onSubmit={(v) => create.mutate(v)} submitting={create.isPending} submitLabel="Criar cartão" />
    </div>
  );
}