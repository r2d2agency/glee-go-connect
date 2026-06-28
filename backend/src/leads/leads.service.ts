import { Injectable, NotFoundException } from '@nestjs/common';
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
}