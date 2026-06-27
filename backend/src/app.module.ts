import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { LeadsModule } from './leads/leads.module';
import { AdminModule } from './admin/admin.module';
import { TemplatesModule } from './templates/templates.module';
import { UpgradesModule } from './upgrades/upgrades.module';
import { PlansModule } from './plans/plans.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthController } from './health.controller';
import { BrandingController } from './branding.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CardsModule,
    LeadsModule,
    AdminModule,
    TemplatesModule,
    UpgradesModule,
    PlansModule,
    UploadsModule,
  ],
  controllers: [HealthController, BrandingController],
})
export class AppModule {}