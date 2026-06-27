import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CardsService } from './cards.service';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cards: CardsService) {}

  @Get()
  list(@Req() req: any) {
    return this.cards.list(req.user.companyId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.cards.findOne(req.user.companyId, id);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.cards.create(req.user.companyId, body);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.cards.update(req.user.companyId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.cards.remove(req.user.companyId, id);
  }
}