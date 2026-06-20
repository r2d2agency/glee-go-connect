export interface VCardData {
  fullName: string;
  organization?: string;
  title?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
}

export function buildVCard(d: VCardData): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${d.fullName}`];
  if (d.fullName) {
    const parts = d.fullName.split(" ");
    const last = parts.length > 1 ? parts.pop() : "";
    lines.push(`N:${last};${parts.join(" ")};;;`);
  }
  if (d.organization) lines.push(`ORG:${d.organization}`);
  if (d.title) lines.push(`TITLE:${d.title}`);
  if (d.phone) lines.push(`TEL;TYPE=CELL,VOICE:${d.phone}`);
  if (d.whatsapp) lines.push(`TEL;TYPE=CELL,WHATSAPP:${d.whatsapp}`);
  if (d.email) lines.push(`EMAIL;TYPE=INTERNET:${d.email}`);
  if (d.website) lines.push(`URL:${d.website}`);
  if (d.address) lines.push(`ADR;TYPE=WORK:;;${d.address};;;;`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(d: VCardData) {
  const blob = new Blob([buildVCard(d)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${d.fullName.replace(/\s+/g, "_")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export function randomSlug(): string {
  return Math.random().toString(36).slice(2, 8);
}