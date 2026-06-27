import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  listPublic() {
    return this.prisma.planProduct.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { priceCents: 'asc' }],
    });
  }

  listAll() {
    return this.prisma.planProduct.findMany({
      orderBy: [{ sortOrder: 'asc' }, { priceCents: 'asc' }],
    });
  }

  private validate(body: any, partial = false) {
    const out: any = {};
    const set = (k: string, v: any) => { if (v !== undefined) out[k] = v; };
    if (!partial || body.slug !== undefined) {
      const slug = String(body.slug ?? '').trim().toLowerCase();
      if (!/^[a-z0-9-]{2,40}$/.test(slug)) throw new BadRequestException('Slug inválido.');
      out.slug = slug;
    }
    if (!partial || body.name !== undefined) {
      const name = String(body.name ?? '').trim();
      if (name.length < 2) throw new BadRequestException('Nome obrigatório.');
      out.name = name;
    }
    set('description', body.description ?? null);
    set('priceCents', Number.isFinite(+body.priceCents) ? Math.max(0, Math.round(+body.priceCents)) : undefined);
    set('currency', body.currency ? String(body.currency).toUpperCase().slice(0, 3) : undefined);
    set('billingCycle', body.billingCycle);
    set('includesNfc', body.includesNfc === undefined ? undefined : !!body.includesNfc);
    set('maxBioLinks', body.maxBioLinks === undefined ? undefined : Math.max(0, parseInt(body.maxBioLinks)));
    set('maxCards', body.maxCards === undefined ? undefined : Math.max(0, parseInt(body.maxCards)));
    set('features', body.features ?? undefined);
    set('active', body.active === undefined ? undefined : !!body.active);
    set('highlight', body.highlight === undefined ? undefined : !!body.highlight);
    set('sortOrder', body.sortOrder === undefined ? undefined : parseInt(body.sortOrder));
    return out;
  }

  async create(body: any) {
    const data = this.validate(body);
    const dup = await this.prisma.planProduct.findUnique({ where: { slug: data.slug } });
    if (dup) throw new ConflictException('Slug já existe.');
    return this.prisma.planProduct.create({ data });
  }

  async update(id: string, body: any) {
    const exists = await this.prisma.planProduct.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException();
    const data = this.validate(body, true);
    return this.prisma.planProduct.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.planProduct.delete({ where: { id } });
    return { ok: true };
  }
}