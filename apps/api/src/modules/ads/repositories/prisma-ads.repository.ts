import { Injectable } from '@nestjs/common';
import type { Ad, Campaign } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  IAdsRepository,
  AdCreateData,
  AdUpdateData,
} from './ads.repository.js';

@Injectable()
export class PrismaAdsRepository implements IAdsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCampaignByIdAndUser(
    campaignId: string,
    userId: string,
  ): Promise<Campaign | null> {
    return this.prisma.campaign.findFirst({
      where: { id: campaignId, userId },
    });
  }

  findAllByCampaign(campaignId: string): Promise<Ad[]> {
    return this.prisma.ad.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findDuplicateTitle(campaignId: string, title: string): Promise<Ad | null> {
    return this.prisma.ad.findFirst({
      where: { campaignId, title: { equals: title, mode: 'insensitive' } },
    });
  }

  findById(id: string): Promise<Ad | null> {
    return this.prisma.ad.findUnique({ where: { id } });
  }

  create(data: AdCreateData): Promise<Ad> {
    return this.prisma.ad.create({ data });
  }

  update(id: string, data: AdUpdateData): Promise<Ad> {
    return this.prisma.ad.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ad.delete({ where: { id } });
  }
}
