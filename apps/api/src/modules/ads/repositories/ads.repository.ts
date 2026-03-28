import type { Ad, AdFormat, Campaign } from '@prisma/client';

export interface AdCreateData {
  campaignId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl: string;
  format?: AdFormat;
  isActive?: boolean;
}

export interface AdUpdateData {
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  format?: AdFormat;
  isActive?: boolean;
}

export interface IAdsRepository {
  findCampaignByIdAndUser(
    campaignId: string,
    userId: string,
  ): Promise<Campaign | null>;
  findAllByCampaign(campaignId: string): Promise<Ad[]>;
  findDuplicateTitle(campaignId: string, title: string): Promise<Ad | null>;
  findById(id: string): Promise<Ad | null>;
  create(data: AdCreateData): Promise<Ad>;
  update(id: string, data: AdUpdateData): Promise<Ad>;
  delete(id: string): Promise<void>;
}
