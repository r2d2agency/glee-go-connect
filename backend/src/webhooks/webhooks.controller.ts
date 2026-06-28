import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private hooks: WebhooksService) {}

  @Get('events')
  events() {
    return { events: WebhooksService.events() };
  }

  @Get()
  list(@Req() req: any) {
    return this.hooks.list(req.user.companyId);
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.hooks.create(req.user.companyId, body);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.hooks.update(req.user.companyId, id, body);
  }

  @Post(':id/rotate')
  rotate(@Req() req: any, @Param('id') id: string) {
    return this.hooks.rotateSecret(req.user.companyId, id);
  }

  @Post(':id/test')
  test(@Req() req: any, @Param('id') id: string) {
    return this.hooks.test(req.user.companyId, id);
  }

  @Get(':id/deliveries')
  deliveries(@Req() req: any, @Param('id') id: string) {
    return this.hooks.listDeliveries(req.user.companyId, id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.hooks.remove(req.user.companyId, id);
  }
}