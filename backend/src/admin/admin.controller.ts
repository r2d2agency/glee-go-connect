import { Body, Controller, ForbiddenException, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
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
}