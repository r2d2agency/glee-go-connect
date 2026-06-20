import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PublicCardsController } from './public-cards.controller';

@Module({
  controllers: [CardsController, PublicCardsController],
  providers: [CardsService],
})
export class CardsModule {}