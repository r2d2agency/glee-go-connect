import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.card.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  create(companyId: string, data: any) {
    return this.prisma.card.create({ data: { ...data, companyId } });
  }

  async update(companyId: string, id: string, data: any) {
    const card = await this.prisma.card.findFirst({ where: { id, companyId } });
    if (!card) throw new NotFoundException();
    return this.prisma.card.update({ where: { id }, data });
  }

  async remove(companyId: string, id: string) {
    const card = await this.prisma.card.findFirst({ where: { id, companyId } });
    if (!card) throw new NotFoundException();
    await this.prisma.card.delete({ where: { id } });
    return { ok: true };
  }

  async findPublic(slug: string) {
    const card = await this.prisma.card.findUnique({ where: { slug } });
    if (!card || !card.active) throw new NotFoundException();
    return card;
  }
}