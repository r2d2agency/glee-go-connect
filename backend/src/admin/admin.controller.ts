import { Body, Controller, ForbiddenException, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  private ensureMaster(req: any) {
    if (req.user?.role !== 'ADMIN_MASTER') {
      throw new ForbiddenException('Apenas ADMIN_MASTER');
    }
  }

  @Get('stats')
  async stats(@Req() req: any) {
    this.ensureMaster(req);
    const [companies, users, cards, bioLinks, digitalCards, leads,
      pending, approved, rejected, waiting, producing, shipped, delivered, activated,
      withNfc] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.user.count(),
      this.prisma.card.count(),
      this.prisma.card.count({ where: { type: 'BIO_LINK' } }),
      this.prisma.card.count({ where: { type: 'DIGITAL_CARD' } }),
      this.prisma.lead.count(),
      this.prisma.upgradeRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.upgradeRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.upgradeRequest.count({ where: { status: 'REJECTED' } }),
      this.prisma.upgradeRequest.count({ where: { fulfillmentStatus: 'WAITING', status: 'APPROVED' } }),
      this.prisma.upgradeRequest.count({ where: { fulfillmentStatus: 'PRODUCING' } }),
      this.prisma.upgradeRequest.count({ where: { fulfillmentStatus: 'SHIPPED' } }),
      this.prisma.upgradeRequest.count({ where: { fulfillmentStatus: 'DELIVERED' } }),
      this.prisma.upgradeRequest.count({ where: { fulfillmentStatus: 'ACTIVATED' } }),
      this.prisma.card.count({ where: { nfcSerial: { not: null } } }),
    ]);
    const byPlan = await this.prisma.company.groupBy({ by: ['plan'], _count: { _all: true } });
    return {
      companies, users, cards, bioLinks, digitalCards, leads, withNfc,
      upgrades: { pending, approved, rejected },
      fulfillment: { waiting, producing, shipped, delivered, activated },
      byPlan: byPlan.map((p) => ({ plan: p.plan, count: p._count._all })),
    };
  }

  @Get('cards')
  async cards(@Req() req: any, @Query('type') type?: string, @Query('nfc') nfc?: string) {
    this.ensureMaster(req);
    return this.prisma.card.findMany({
      where: {
        ...(type ? { type: type as any } : {}),
        ...(nfc === 'linked' ? { nfcSerial: { not: null } } : {}),
        ...(nfc === 'unlinked' ? { nfcSerial: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { id: true, name: true, email: true, plan: true } } },
    });
  }

  @Get('companies')
  async companies(@Req() req: any) {
    this.ensureMaster(req);
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, cards: true } } },
    });
  }

  @Get('users')
  async users(@Req() req: any) {
    this.ensureMaster(req);
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, companyId: true, createdAt: true },
    });
  }

  @Patch('users/:id')
  async updateUser(@Req() req: any, @Param('id') id: string, @Body() body: { role?: string }) {
    this.ensureMaster(req);
    return this.prisma.user.update({
      where: { id },
      data: { role: body.role as any },
      select: { id: true, email: true, role: true },
    });
  }

  @Patch('companies/:id')
  async updateCompany(@Req() req: any, @Param('id') id: string, @Body() body: { active?: boolean; plan?: string }) {
    this.ensureMaster(req);
    return this.prisma.company.update({
      where: { id },
      data: { active: body.active, plan: body.plan as any },
    });
  }

  @Get('branding')
  async getBranding(@Req() req: any) {
    this.ensureMaster(req);
    const rows = await this.prisma.setting.findMany({ where: { key: { startsWith: 'branding.' } } });
    return Object.fromEntries(rows.map((r) => [r.key.replace('branding.', ''), r.value]));
  }

  @Put('branding')
  async setBranding(@Req() req: any, @Body() body: Record<string, string>) {
    this.ensureMaster(req);
    const entries = Object.entries(body || {});
    await Promise.all(
      entries.map(([k, v]) =>
        this.prisma.setting.upsert({
          where: { key: `branding.${k}` },
          create: { key: `branding.${k}`, value: String(v ?? '') },
          update: { value: String(v ?? '') },
        }),
      ),
    );
    return { ok: true };
  }
}