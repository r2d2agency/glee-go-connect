import { Body, Controller, Get, Header, Post, Req, Res, UseGuards } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  async export(@Req() req: any, @Res() res: any) {
    const csv = await this.leads.exportCsv(req.user.companyId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXlsx(@Req() req: any, @Res() res: any) {
    const buf = await this.leads.exportXlsx(req.user.companyId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${Date.now()}.xlsx"`);
    res.send(buf);
  }
}