import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('branding')
export class BrandingController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async get() {
    try {
      const rows = await this.prisma.setting.findMany({ where: { key: { startsWith: 'branding.' } } });
      return Object.fromEntries(rows.map((r) => [r.key.replace('branding.', ''), r.value]));
    } catch {
      return {};
    }
  }
}