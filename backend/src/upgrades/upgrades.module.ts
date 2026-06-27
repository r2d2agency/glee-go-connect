import { Module } from '@nestjs/common';
import { UpgradesController } from './upgrades.controller';
import { UpgradesService } from './upgrades.service';

@Module({
  controllers: [UpgradesController],
  providers: [UpgradesService],
})
export class UpgradesModule {}