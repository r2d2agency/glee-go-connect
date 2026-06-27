import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpgradesService } from './upgrades.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class UpgradesController {
  constructor(private svc: UpgradesService) {}

  private ensureMaster(req: any) {
    if (req.user?.role !== 'ADMIN_MASTER') {
      throw new ForbiddenException('Apenas ADMIN_MASTER');
    }
  }

  // ===== Client =====
  @Post('upgrades')
  create(@Req() req: any, @Body() body: any) {
    return this.svc.createForCompany(req.user.companyId, req.user.sub ?? req.user.id, body);
  }

  @Get('upgrades/mine')
  mine(@Req() req: any) {
    return this.svc.listMine(req.user.companyId);
  }

  // ===== Admin =====
  @Get('admin/upgrades')
  list(@Req() req: any, @Query('status') status?: string) {
    this.ensureMaster(req);
    return this.svc.listAll(status);
  }

  @Post('admin/upgrades/:id/approve')
  approve(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ensureMaster(req);
    return this.svc.approve(id, body);
  }

  @Post('admin/upgrades/:id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ensureMaster(req);
    return this.svc.reject(id, body);
  }

  @Patch('admin/cards/:id/nfc')
  linkNfc(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ensureMaster(req);
    return this.svc.linkNfc(id, body);
  }

  @Patch('admin/cards/:id/nfc/unlink')
  unlinkNfc(@Req() req: any, @Param('id') id: string) {
    this.ensureMaster(req);
    return this.svc.unlinkNfc(id);
  }
}