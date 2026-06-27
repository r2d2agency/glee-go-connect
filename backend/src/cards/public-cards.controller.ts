import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('public/cards')
export class PublicCardsController {
  constructor(private cards: CardsService) {}

  @Get(':slug')
  async show(@Param('slug') slug: string) {
    return this.cards.findPublic(slug);
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