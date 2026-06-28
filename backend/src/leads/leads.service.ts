import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async capture(data: { cardId?: string; slug?: string; name: string; email?: string; phone?: string; message?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }) {
    let cardId = data.cardId;
    if (!cardId && data.slug) {
      const card = await this.prisma.card.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (!card) throw new NotFoundException('Cartão não encontrado');
      cardId = card.id;
    }
    if (!cardId) throw new NotFoundException('Cartão não informado');
    const { slug: _slug, cardId: _c, ...rest } = data as any;
    return this.prisma.lead.create({ data: { ...rest, cardId } });
  }

  listByCompany(companyId: string) {
    return this.prisma.lead.findMany({
      where: { card: { companyId } },
      orderBy: { createdAt: 'desc' },
      include: { card: { select: { fullName: true, slug: true } } },
    });
  }

  async exportCsv(companyId: string): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { plan: true },
    });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    if (company.plan === 'FREE') {
      throw new ForbiddenException('Exportação disponível apenas nos planos Pro e Business');
    }
    const leads = await this.prisma.lead.findMany({
      where: { card: { companyId } },
      orderBy: { createdAt: 'desc' },
      include: { card: { select: { fullName: true, slug: true } } },
    });
    const header = ['data', 'nome', 'whatsapp', 'email', 'mensagem', 'cartao', 'slug', 'utm_source', 'utm_medium', 'utm_campaign'];
    const esc = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = leads.map((l: any) => [
      new Date(l.createdAt).toISOString(),
      l.name,
      l.phone,
      l.email,
      l.message,
      l.card?.fullName,
      l.card?.slug,
      l.utmSource,
      l.utmMedium,
      l.utmCampaign,
    ].map(esc).join(','));
    return [header.join(','), ...rows].join('\n');
  }
}