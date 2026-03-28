export type AdFormat = 'BANNER' | 'VIDEO' | 'CAROUSEL' | 'NATIVE';

export interface Ad {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetUrl: string;
  format: AdFormat;
  impressions: number;
  clicks: number;
  isActive: boolean;
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdPayload {
  title: string;
  description?: string;
  targetUrl: string;
  format: AdFormat;
}
