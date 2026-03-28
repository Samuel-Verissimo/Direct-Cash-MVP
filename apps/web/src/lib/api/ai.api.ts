import { request } from './client';
import type {
  GenerateCampaignPayload,
  GeneratedCampaign,
  GenerateAdsPayload,
  GeneratedAd,
} from '../types/ai.types';

export async function generateCampaignWithAI(
  token: string,
  payload: GenerateCampaignPayload,
): Promise<GeneratedCampaign> {
  return request<GeneratedCampaign>('/ai/generate-campaign', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function generateAdsWithAI(
  token: string,
  payload: GenerateAdsPayload,
): Promise<GeneratedAd[]> {
  return request<GeneratedAd[]>('/ai/generate-ads', {
    method: 'POST',
    token,
    body: payload,
  });
}
