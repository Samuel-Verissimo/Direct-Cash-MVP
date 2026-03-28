import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller.js';
import { CampaignsService } from './campaigns.service.js';
import { PrismaCampaignsRepository } from './repositories/prisma-campaigns.repository.js';

@Module({
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    { provide: 'CAMPAIGNS_REPOSITORY', useClass: PrismaCampaignsRepository },
  ],
  exports: [CampaignsService],
})
export class CampaignsModule {}
