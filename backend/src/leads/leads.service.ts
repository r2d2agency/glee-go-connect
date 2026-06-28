import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService, private webhooks: WebhooksService) {}

  async capture(data: { cardId?: string; slug?: string; name: string; email?: string; phone?: string; message?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }) {
    let cardId = data.cardId;
    if (!cardId && data.slug) {
      const card = await this.prisma.card.findUnique({ where: { slug: data.slug }, select: { id: true } });
      if (!card) throw new NotFoundException('Cartão não encontrado');
      cardId = card.id;
    }
    if (!cardId) throw new NotFoundException('Cartão não informado');
    const { slug: _slug, cardId: _c, ...rest } = data as any;
    const lead = await this.prisma.lead.create({
      data: { ...rest, cardId },
      include: { card: { select: { slug: true, fullName: true, companyId: true } } },
    });
    if (lead.card?.companyId) {
      this.webhooks.dispatch(
        lead.card.companyId,
        'lead.created',
        {
          lead: {
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            message: lead.message,
            utm_source: lead.utmSource,
            utm_medium: lead.utmMedium,
            utm_campaign: lead.utmCampaign,
            created_at: lead.createdAt,
          },
          card: { slug: lead.card.slug, name: lead.card.fullName },
        },
        { cardSlug: lead.card.slug },
      );
    }
    return lead;
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

  async exportXlsx(companyId: string): Promise<Buffer> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { plan: true, name: true },
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

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Glee-go ID';
    wb.created = new Date();
    const ws = wb.addWorksheet('Leads');

    ws.columns = [
      { header: 'Data', key: 'createdAt', width: 20 },
      { header: 'Nome', key: 'name', width: 28 },
      { header: 'WhatsApp', key: 'phone', width: 18 },
      { header: 'E-mail', key: 'email', width: 30 },
      { header: 'Mensagem', key: 'message', width: 40 },
      { header: 'Cartão', key: 'cardName', width: 24 },
      { header: 'Slug', key: 'slug', width: 18 },
      { header: 'UTM Source', key: 'utmSource', width: 16 },
      { header: 'UTM Medium', key: 'utmMedium', width: 16 },
      { header: 'UTM Campaign', key: 'utmCampaign', width: 18 },
    ];

    const header = ws.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22D36A' } };
    header.alignment = { vertical: 'middle', horizontal: 'left' };
    header.height = 22;

    leads.forEach((l: any) => {
      ws.addRow({
        createdAt: new Date(l.createdAt).toLocaleString('pt-BR'),
        name: l.name,
        phone: l.phone,
        email: l.email,
        message: l.message,
        cardName: l.card?.fullName,
        slug: l.card?.slug,
        utmSource: l.utmSource,
        utmMedium: l.utmMedium,
        utmCampaign: l.utmCampaign,
      });
    });

    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columns.length } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf as ArrayBuffer);
  }
}