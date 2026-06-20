import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  capture(data: { cardId: string; name: string; email?: string; phone?: string; message?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string }) {
    return this.prisma.lead.create({ data });
  }

  listByCompany(companyId: string) {
    return this.prisma.lead.findMany({
      where: { card: { companyId } },
      orderBy: { createdAt: 'desc' },
      include: { card: { select: { fullName: true, slug: true } } },
    });
  }
}