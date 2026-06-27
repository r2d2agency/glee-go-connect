import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('public/cards')
export class PublicCardsController {
  constructor(private cards: CardsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string, @Req() req: any, @Headers() headers: any) {
    const card = await this.cards.findPublic(slug);
    // fire-and-forget server-side view event (best effort)
    this.cards.trackEvent(card.id, 'view', {
      ip: (headers['x-forwarded-for'] || headers['x-real-ip'] || req.ip || '').toString().split(',')[0].trim(),
      country: headers['cf-ipcountry'] || headers['x-vercel-ip-country'] || null,
      city: headers['cf-ipcity'] || headers['x-vercel-ip-city'] || null,
      ua: headers['user-agent'] || null,
      referer: headers['referer'] || headers['referrer'] || null,
      side: 'server',
    }).catch(() => {});
    return card;
  }

  @Post('track')
  track(@Body() body: any, @Req() req: any, @Headers() headers: any) {
    return this.cards.trackBySlug(body?.slug, body?.type || 'view', {
      ...(body?.payload || {}),
      ip: (headers['x-forwarded-for'] || headers['x-real-ip'] || req.ip || '').toString().split(',')[0].trim(),
      country: headers['cf-ipcountry'] || headers['x-vercel-ip-country'] || body?.payload?.country || null,
      city: headers['cf-ipcity'] || headers['x-vercel-ip-city'] || body?.payload?.city || null,
      ua: headers['user-agent'] || null,
      side: 'client',
    });
  }
}