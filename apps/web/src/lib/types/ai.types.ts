import type { AdFormat } from './ad.types';

export interface GenerateCampaignPayload {
  brief: string;
}

export interface GeneratedCampaign {
  name: string;
  description: string;
  suggestedBudget: number;
  suggestedDurationDays: number;
  reasoning: string;
}

export interface GenerateAdsPayload {
  campaignName: string;
  campaignDescription: string;
  format?: AdFormat;
  count?: number;
}

export interface GeneratedAd {
  title: string;
  description: string;
  targetUrl: string;
  format: AdFormat;
}
