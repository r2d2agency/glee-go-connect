import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private leads: LeadsService) {}

  @Post('public')
  capture(@Body() body: any) {
    return this.leads.capture(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Req() req: any) {
    return this.leads.listByCompany(req.user.companyId);
  }
}