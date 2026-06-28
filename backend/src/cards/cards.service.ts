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
    const card = await this.prisma.card.findUnique({
      where: { slug },
      include: { company: { select: { plan: true } } },
    });
    if (!card || !card.active) throw new NotFoundException();
    return card;
  }

  async trackEvent(cardId: string, type: string, payload: any) {
    return this.prisma.analyticsEvent.create({ data: { cardId, type, payload } });
  }

  async trackBySlug(slug: string, type: string, payload: any) {
    if (!slug) return { ok: false };
    const card = await this.prisma.card.findUnique({ where: { slug }, select: { id: true } });
    if (!card) return { ok: false };
    await this.prisma.analyticsEvent.create({ data: { cardId: card.id, type, payload } });
    return { ok: true };
  }

  async analyticsSummary(companyId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const cards = await this.prisma.card.findMany({
      where: { companyId },
      select: { id: true, slug: true, fullName: true },
    });
    const cardIds = cards.map((c) => c.id);
    if (cardIds.length === 0) {
      return { totalViews: 0, totalClicks: 0, daily: [], sources: [], referrers: [], countries: [], cities: [], devices: [], topCards: [], cards };
    }
    const events = await this.prisma.analyticsEvent.findMany({
      where: { cardId: { in: cardIds }, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { date: string; views: number; clicks: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, views: 0, clicks: 0 });
    }
    const bump = (map: Map<string, number>, key: any) => {
      const k = (key == null || key === '') ? 'direct' : String(key).slice(0, 80);
      map.set(k, (map.get(k) || 0) + 1);
    };
    const sources = new Map<string, number>();
    const referrers = new Map<string, number>();
    const countries = new Map<string, number>();
    const cities = new Map<string, number>();
    const devices = new Map<string, number>();
    const byCard = new Map<string, number>();
    let totalViews = 0, totalClicks = 0;

    for (const ev of events) {
      const p = (ev.payload || {}) as any;
      const day = ev.createdAt.toISOString().slice(0, 10);
      const slot = dailyMap.get(day);
      if (slot) {
        if (ev.type === 'view') slot.views++;
        else slot.clicks++;
      }
      if (ev.type === 'view') {
        totalViews++;
        byCard.set(ev.cardId, (byCard.get(ev.cardId) || 0) + 1);
      } else {
        totalClicks++;
      }
      bump(sources, p.utmSource || p.utm_source);
      const ref = p.referer || p.referrer;
      if (ref) {
        try { bump(referrers, new URL(ref).hostname); }
        catch { bump(referrers, ref); }
      } else bump(referrers, 'direct');
      bump(countries, p.country);
      bump(cities, p.city);
      const ua = String(p.ua || '');
      const device = /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : ua ? 'desktop' : 'unknown';
      bump(devices, device);
    }

    const top = (m: Map<string, number>, n = 8) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, count]) => ({ key, count }));

    const topCards = [...byCard.entries()]
      .map(([id, count]) => ({ count, card: cards.find((c) => c.id === id) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      totalClicks,
      daily: [...dailyMap.values()],
      sources: top(sources),
      referrers: top(referrers),
      countries: top(countries),
      cities: top(cities),
      devices: top(devices),
      topCards,
      cards,
    };
  }
}