import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.card.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(companyId: string, id: string) {
    const card = await this.prisma.card.findFirst({ where: { id, companyId } });
    if (!card) throw new NotFoundException();
    return card;
  }

  async create(companyId: string, data: any) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Empresa não encontrada');

    const type = data.type === 'DIGITAL_CARD' ? 'DIGITAL_CARD' : 'BIO_LINK';

    // Cartão NFC só é criado pelo admin através das solicitações de upgrade.
    if (type === 'DIGITAL_CARD') {
      throw new ForbiddenException(
        'Cartões NFC são emitidos pela equipe Glee-go. Solicite seu upgrade no painel.',
      );
    }
    if (company.plan === 'FREE') {
      const count = await this.prisma.card.count({ where: { companyId, type: 'BIO_LINK' } });
      if (count >= 1) {
        throw new ForbiddenException(
          'Plano grátis permite apenas 1 link bio. Faça upgrade para criar mais.',
        );
      }
    }

    if (!data.slug || !/^[a-z0-9-]{2,40}$/.test(data.slug)) {
      throw new ConflictException('Slug inválido. Use letras minúsculas, números e hífen (2 a 40 caracteres).');
    }
    const exists = await this.prisma.card.findUnique({ where: { slug: data.slug } });
    if (exists) throw new ConflictException('Este link já está em uso. Escolha outro slug.');

    return this.prisma.card.create({ data: { ...data, type, companyId } });
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