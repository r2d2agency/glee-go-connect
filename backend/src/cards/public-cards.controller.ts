import { Controller, Get, Param } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('public/cards')
export class PublicCardsController {
  constructor(private cards: CardsService) {}

  @Get(':slug')
  show(@Param('slug') slug: string) {
    return this.cards.findPublic(slug);
  }
}