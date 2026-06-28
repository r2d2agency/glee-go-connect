import { Body, Controller, Get, Headers, Param, Post, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CardsService } from './cards.service';

@Controller()
export class PublicCardsController {
  constructor(private cards: CardsService) {}

  @Get('public/cards/:slug')
  async show(@Param('slug') slug: string) {
    return this.cards.findPublic(slug);
  }

  @Post('public/cards/track')
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

  @Get('vcard/:slug')
  async vcard(@Param('slug') slug: string, @Res() res: Response) {
    const card: any = await this.cards.findPublic(slug);
    const esc = (v: string) => String(v || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${esc(card.fullName)}`];
    if (card.fullName) {
      const parts = String(card.fullName).split(' ');
      const last = parts.length > 1 ? parts.pop() : '';
      lines.push(`N:${esc(last || '')};${esc(parts.join(' '))};;;`);
    }
    if (card.company?.name || card.companyName) lines.push(`ORG:${esc(card.companyName || card.company?.name)}`);
    if (card.jobTitle) lines.push(`TITLE:${esc(card.jobTitle)}`);
    if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(card.phone)}`);
    if (card.whatsapp) lines.push(`TEL;TYPE=CELL,WHATSAPP:${esc(card.whatsapp)}`);
    if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(card.email)}`);
    if (card.website) lines.push(`URL:${esc(card.website)}`);
    if (card.address) lines.push(`ADR;TYPE=WORK:;;${esc(card.address)};;;;`);
    if (card.bio) lines.push(`NOTE:${esc(card.bio)}`);
    lines.push('END:VCARD');
    const vcf = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.vcf"`);
    res.send(vcf);
  }
}