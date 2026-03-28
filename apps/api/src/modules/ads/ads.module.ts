import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller.js';
import { AdsService } from './ads.service.js';
import { PrismaAdsRepository } from './repositories/prisma-ads.repository.js';

@Module({
  controllers: [AdsController],
  providers: [
    AdsService,
    { provide: 'ADS_REPOSITORY', useClass: PrismaAdsRepository },
  ],
  exports: [AdsService],
})
export class AdsModule {}
