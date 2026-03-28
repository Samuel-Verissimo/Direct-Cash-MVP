import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Ad } from '@prisma/client';
import { CreateAdDto } from './dto/create-ad.dto.js';
import { UpdateAdDto } from './dto/update-ad.dto.js';
import type { IAdsRepository } from './repositories/ads.repository.js';

@Injectable()
export class AdsService {
  constructor(
    @Inject('ADS_REPOSITORY')
    private readonly repo: IAdsRepository,
  ) {}

  private async verifyCampaignOwnership(
    campaignId: string,
    userId: string,
  ): Promise<void> {
    const campaign = await this.repo.findCampaignByIdAndUser(
      campaignId,
      userId,
    );
    if (!campaign) {
      throw new NotFoundException('Campanha não encontrada');
    }
  }

  async findAll(campaignId: string, userId: string): Promise<Ad[]> {
    await this.verifyCampaignOwnership(campaignId, userId);
    return this.repo.findAllByCampaign(campaignId);
  }

  async create(
    campaignId: string,
    dto: CreateAdDto,
    userId: string,
  ): Promise<Ad> {
    await this.verifyCampaignOwnership(campaignId, userId);

    const duplicate = await this.repo.findDuplicateTitle(campaignId, dto.title);
    if (duplicate) {
      throw new ConflictException(
        `Esta campanha já possui um anúncio com o título "${dto.title}"`,
      );
    }

    return this.repo.create({
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      targetUrl: dto.targetUrl,
      format: dto.format,
      isActive: dto.isActive,
      campaignId,
    });
  }

  async update(
    campaignId: string,
    id: string,
    dto: UpdateAdDto,
    userId: string,
  ): Promise<Ad> {
    await this.verifyCampaignOwnership(campaignId, userId);

    const ad = await this.repo.findById(id);
    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }
    if (ad.campaignId !== campaignId) {
      throw new ForbiddenException('Acesso negado');
    }

    return this.repo.update(id, {
      title: dto.title,
      description: dto.description,
      imageUrl: dto.imageUrl,
      targetUrl: dto.targetUrl,
      format: dto.format,
      isActive: dto.isActive,
    });
  }

  async remove(campaignId: string, id: string, userId: string): Promise<void> {
    await this.verifyCampaignOwnership(campaignId, userId);

    const ad = await this.repo.findById(id);
    if (!ad) {
      throw new NotFoundException('Anúncio não encontrado');
    }
    if (ad.campaignId !== campaignId) {
      throw new ForbiddenException('Acesso negado');
    }

    await this.repo.delete(id);
  }
}
