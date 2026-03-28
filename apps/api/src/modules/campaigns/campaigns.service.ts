import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Campaign } from '@prisma/client';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { UpdateCampaignDto } from './dto/update-campaign.dto.js';
import { CampaignQueryDto } from './dto/campaign-query.dto.js';
import {
  PaginatedResponseDto,
  CampaignStatsDto,
} from './dto/campaign-response.dto.js';
import type { ICampaignsRepository } from './repositories/campaigns.repository.js';

@Injectable()
export class CampaignsService {
  constructor(
    @Inject('CAMPAIGNS_REPOSITORY')
    private readonly repo: ICampaignsRepository,
  ) {}

  async create(dto: CreateCampaignDto, userId: string): Promise<Campaign> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('endDate deve ser posterior a startDate');
    }

    const duplicate = await this.repo.findDuplicateName(userId, dto.name);
    if (duplicate) {
      throw new ConflictException(
        `Você já possui uma campanha com o nome "${dto.name}"`,
      );
    }

    return this.repo.create({
      name: dto.name,
      description: dto.description,
      budget: dto.budget,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status,
      userId,
    });
  }

  async findAll(
    query: CampaignQueryDto,
    userId: string,
  ): Promise<PaginatedResponseDto<Campaign & { _count: { ads: number } }>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { data, total } = await this.repo.findAllPaginated({
      userId,
      status: query.status,
      search: query.search,
      skip,
      limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Campaign> {
    const campaign = await this.repo.findByIdAndUser(id, userId);
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }
    return campaign;
  }

  async update(
    id: string,
    dto: UpdateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    await this.findOne(id, userId);

    if (dto.name !== undefined) {
      const duplicate = await this.repo.findDuplicateName(userId, dto.name, id);
      if (duplicate) {
        throw new ConflictException(
          `Você já possui uma campanha com o nome "${dto.name}"`,
        );
      }
    }

    if (dto.startDate && dto.endDate) {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('endDate deve ser posterior a startDate');
      }
    }

    return this.repo.update(id, {
      name: dto.name,
      description: dto.description,
      budget: dto.budget,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const campaign = await this.repo.findById(id);
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }
    if (campaign.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }
    await this.repo.delete(id);
  }

  async getStats(id: string, userId: string): Promise<CampaignStatsDto> {
    const campaign = await this.repo.findByIdWithAds(id, userId);
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }

    const totalAds = campaign.ads.length;
    const activeAds = campaign.ads.filter((ad) => ad.isActive).length;
    const totalImpressions = campaign.ads.reduce(
      (sum, ad) => sum + ad.impressions,
      0,
    );
    const totalClicks = campaign.ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const ctr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const budgetUsed = parseFloat(campaign.spent.toString());
    const budgetTotal = parseFloat(campaign.budget.toString());
    const budgetRemaining = budgetTotal - budgetUsed;

    return {
      totalAds,
      activeAds,
      totalImpressions,
      totalClicks,
      ctr: parseFloat(ctr.toFixed(2)),
      budgetUsed,
      budgetRemaining,
    };
  }
}
