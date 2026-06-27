import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PlansService } from './plans.service';

@Controller()
export class PlansController {
  constructor(private svc: PlansService) {}

  // PUBLIC – usado pelo formulário de upgrade
  @Get('plans')
  publicList() {
    return this.svc.listPublic();
  }

  // ADMIN
  @UseGuards(JwtAuthGuard)
  @Get('admin/plans')
  list(@Req() req: any) {
    this.ensureMaster(req);
    return this.svc.listAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/plans')
  create(@Req() req: any, @Body() body: any) {
    this.ensureMaster(req);
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/plans/:id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ensureMaster(req);
    return this.svc.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/plans/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    this.ensureMaster(req);
    return this.svc.remove(id);
  }

  private ensureMaster(req: any) {
    if (req.user?.role !== 'ADMIN_MASTER') throw new ForbiddenException('Apenas ADMIN_MASTER');
  }
}