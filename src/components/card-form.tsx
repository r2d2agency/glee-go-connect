import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface CardFormValues {
  name: string;
  slug: string;
  template: string;
  status: string;
  public_name: string;
  job_title: string | null;
  bio: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  company_name: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  video_url: string | null;
  social_links: { label: string; url: string }[];
  custom_buttons: { label: string; url: string }[];
  capture_leads: boolean;
  seo_title: string | null;
  seo_description: string | null;
  meta_pixel_id: string | null;
  ga_id: string | null;
  gtm_id: string | null;
}

export const TEMPLATES = [
  { value: "minimalist", label: "Minimalista" },
  { value: "executive", label: "Executivo" },
  { value: "modern", label: "Moderno" },
  { value: "commercial", label: "Comercial" },
  { value: "premium_dark", label: "Premium Dark" },
  { value: "clean_light", label: "Clean Light" },
];

export function CardForm({
  initial,
  onSubmit,
  submitting,
  submitLabel = "Salvar",
}: {
  initial: CardFormValues;
  onSubmit: (v: CardFormValues) => void;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const [v, setV] = useState<CardFormValues>(initial);
  const upd = <K extends keyof CardFormValues>(k: K, val: CardFormValues[K]) => setV((p) => ({ ...p, [k]: val }));

  const addSocial = () => upd("social_links", [...v.social_links, { label: "", url: "" }]);
  const setSocial = (i: number, key: "label" | "url", val: string) => {
    const next = [...v.social_links]; next[i] = { ...next[i], [key]: val }; upd("social_links", next);
  };
  const rmSocial = (i: number) => upd("social_links", v.social_links.filter((_, idx) => idx !== i));

  const addBtn = () => upd("custom_buttons", [...v.custom_buttons, { label: "", url: "" }]);
  const setBtn = (i: number, key: "label" | "url", val: string) => {
    const next = [...v.custom_buttons]; next[i] = { ...next[i], [key]: val }; upd("custom_buttons", next);
  };
  const rmBtn = (i: number) => upd("custom_buttons", v.custom_buttons.filter((_, idx) => idx !== i));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(v); }} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="pro">Pro / SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="p-6 space-y-4 shadow-card">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nome do cartão (interno)"><Input value={v.name} onChange={(e) => upd("name", e.target.value)} required /></Field>
              <Field label="Slug público (URL)"><Input value={v.slug} onChange={(e) => upd("slug", e.target.value)} required pattern="[a-z0-9-]+" /></Field>
              <Field label="Nome público"><Input value={v.public_name} onChange={(e) => upd("public_name", e.target.value)} required /></Field>
              <Field label="Cargo"><Input value={v.job_title || ""} onChange={(e) => upd("job_title", e.target.value || null)} /></Field>
              <Field label="Empresa (público)"><Input value={v.company_name || ""} onChange={(e) => upd("company_name", e.target.value || null)} /></Field>
              <Field label="Template">
                <Select value={v.template} onValueChange={(val) => upd("template", val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Bio curta"><Textarea value={v.bio || ""} onChange={(e) => upd("bio", e.target.value || null)} rows={3} maxLength={280} /></Field>
            <Field label="URL da foto"><Input value={v.avatar_url || ""} onChange={(e) => upd("avatar_url", e.target.value || null)} placeholder="https://..." /></Field>
            <div className="flex items-center gap-3">
              <Switch checked={v.status === "active"} onCheckedChange={(c) => upd("status", c ? "active" : "inactive")} />
              <span className="text-sm">Cartão {v.status === "active" ? "ativo" : "inativo"}</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card className="p-6 space-y-4 shadow-card grid md:grid-cols-2 gap-4">
            <Field label="WhatsApp (com DDD/país)"><Input value={v.whatsapp || ""} onChange={(e) => upd("whatsapp", e.target.value || null)} placeholder="5511999998888" /></Field>
            <Field label="Telefone"><Input value={v.phone || ""} onChange={(e) => upd("phone", e.target.value || null)} /></Field>
            <Field label="E-mail"><Input type="email" value={v.email || ""} onChange={(e) => upd("email", e.target.value || null)} /></Field>
            <Field label="Site"><Input type="url" value={v.website || ""} onChange={(e) => upd("website", e.target.value || null)} placeholder="https://" /></Field>
            <Field label="Endereço" className="md:col-span-2"><Input value={v.address || ""} onChange={(e) => upd("address", e.target.value || null)} /></Field>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <Card className="p-6 space-y-6 shadow-card">
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Redes sociais</h3>
                <Button type="button" size="sm" variant="outline" onClick={addSocial}><Plus className="size-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {v.social_links.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Instagram" value={s.label} onChange={(e) => setSocial(i, "label", e.target.value)} className="w-40" />
                    <Input placeholder="https://" value={s.url} onChange={(e) => setSocial(i, "url", e.target.value)} />
                    <Button type="button" size="icon" variant="ghost" onClick={() => rmSocial(i)}><Trash2 className="size-4" /></Button>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Botões personalizados</h3>
                <Button type="button" size="sm" variant="outline" onClick={addBtn}><Plus className="size-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2">
                {v.custom_buttons.map((b, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Label" value={b.label} onChange={(e) => setBtn(i, "label", e.target.value)} className="w-40" />
                    <Input placeholder="https://" value={b.url} onChange={(e) => setBtn(i, "url", e.target.value)} />
                    <Button type="button" size="icon" variant="ghost" onClick={() => rmBtn(i)}><Trash2 className="size-4" /></Button>
                  </div>
                ))}
              </div>
            </section>
            <Field label="Vídeo (YouTube/Vimeo embed URL)"><Input value={v.video_url || ""} onChange={(e) => upd("video_url", e.target.value || null)} placeholder="https://www.youtube.com/embed/..." /></Field>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card className="p-6 space-y-4 shadow-card grid md:grid-cols-2 gap-4">
            <Field label="Cor principal"><Input type="color" value={v.primary_color} onChange={(e) => upd("primary_color", e.target.value)} className="h-12" /></Field>
            <Field label="Cor secundária"><Input type="color" value={v.secondary_color} onChange={(e) => upd("secondary_color", e.target.value)} className="h-12" /></Field>
            <Field label="Logo da empresa (URL)" className="md:col-span-2"><Input value={v.logo_url || ""} onChange={(e) => upd("logo_url", e.target.value || null)} placeholder="https://..." /></Field>
          </Card>
        </TabsContent>

        <TabsContent value="pro">
          <Card className="p-6 space-y-4 shadow-card">
            <div className="flex items-center gap-3">
              <Switch checked={v.capture_leads} onCheckedChange={(c) => upd("capture_leads", c)} />
              <span className="text-sm">Ativar formulário de captura de leads</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="SEO — Title"><Input value={v.seo_title || ""} onChange={(e) => upd("seo_title", e.target.value || null)} maxLength={60} /></Field>
              <Field label="SEO — Description"><Input value={v.seo_description || ""} onChange={(e) => upd("seo_description", e.target.value || null)} maxLength={160} /></Field>
              <Field label="Meta Pixel ID"><Input value={v.meta_pixel_id || ""} onChange={(e) => upd("meta_pixel_id", e.target.value || null)} /></Field>
              <Field label="Google Analytics ID"><Input value={v.ga_id || ""} onChange={(e) => upd("ga_id", e.target.value || null)} placeholder="G-XXXXXX" /></Field>
              <Field label="Google Tag Manager ID"><Input value={v.gtm_id || ""} onChange={(e) => upd("gtm_id", e.target.value || null)} placeholder="GTM-XXXX" /></Field>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting} style={{ background: "var(--gradient-primary)" }}>
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1.5 " + (className || "")}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

export const emptyCardForm: CardFormValues = {
  name: "",
  slug: "",
  template: "minimalist",
  status: "active",
  public_name: "",
  job_title: null,
  bio: null,
  whatsapp: null,
  phone: null,
  email: null,
  website: null,
  address: null,
  company_name: null,
  avatar_url: null,
  logo_url: null,
  primary_color: "#1E40AF",
  secondary_color: "#10B981",
  video_url: null,
  social_links: [],
  custom_buttons: [],
  capture_leads: false,
  seo_title: null,
  seo_description: null,
  meta_pixel_id: null,
  ga_id: null,
  gtm_id: null,
};