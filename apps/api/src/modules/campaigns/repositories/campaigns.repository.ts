import type { Campaign, Ad, CampaignStatus } from '@prisma/client';

export interface CampaignFindAllParams {
  userId: string;
  status?: CampaignStatus;
  search?: string;
  skip: number;
  limit: number;
}

export interface CampaignCreateData {
  userId: string;
  name: string;
  description?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: CampaignStatus;
}

export interface CampaignUpdateData {
  name?: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status?: CampaignStatus;
}

export interface ICampaignsRepository {
  findAllPaginated(params: CampaignFindAllParams): Promise<{
    data: (Campaign & { _count: { ads: number } })[];
    total: number;
  }>;
  findByIdAndUser(id: string, userId: string): Promise<Campaign | null>;
  findById(id: string): Promise<Campaign | null>;
  findByIdWithAds(
    id: string,
    userId: string,
  ): Promise<(Campaign & { ads: Ad[] }) | null>;
  findDuplicateName(
    userId: string,
    name: string,
    excludeId?: string,
  ): Promise<Campaign | null>;
  create(data: CampaignCreateData): Promise<Campaign>;
  update(id: string, data: CampaignUpdateData): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
