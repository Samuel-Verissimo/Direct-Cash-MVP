import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Campaign, Ad } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  ICampaignsRepository,
  CampaignFindAllParams,
  CampaignCreateData,
  CampaignUpdateData,
} from './campaigns.repository.js';

@Injectable()
export class PrismaCampaignsRepository implements ICampaignsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaginated(params: CampaignFindAllParams): Promise<{
    data: (Campaign & { _count: { ads: number } })[];
    total: number;
  }> {
    const { userId, status, search, skip, limit } = params;

    const where: Prisma.CampaignWhereInput = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { ads: true } } },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { data, total };
  }

  findByIdAndUser(id: string, userId: string): Promise<Campaign | null> {
    return this.prisma.campaign.findFirst({ where: { id, userId } });
  }

  findById(id: string): Promise<Campaign | null> {
    return this.prisma.campaign.findUnique({ where: { id } });
  }

  findByIdWithAds(
    id: string,
    userId: string,
  ): Promise<(Campaign & { ads: Ad[] }) | null> {
    return this.prisma.campaign.findFirst({
      where: { id, userId },
      include: { ads: true },
    });
  }

  findDuplicateName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<Campaign | null> {
    return this.prisma.campaign.findFirst({
      where: {
        userId,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  create(data: CampaignCreateData): Promise<Campaign> {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        budget: new Prisma.Decimal(data.budget),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
        userId: data.userId,
      },
    });
  }

  update(id: string, data: CampaignUpdateData): Promise<Campaign> {
    const updateData: Prisma.CampaignUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.budget !== undefined)
      updateData.budget = new Prisma.Decimal(data.budget);
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.campaign.update({ where: { id }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.campaign.delete({ where: { id } });
  }
}
