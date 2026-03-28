import { request } from './client';
import type { Campaign, CampaignPage, CampaignPayload } from '../types/campaign.types';

export async function fetchCampaigns(token: string): Promise<CampaignPage> {
  return request<CampaignPage>('/campaigns', {
    method: 'GET',
    token,
    query: { limit: 100 },
  });
}

export async function createCampaign(token: string, payload: CampaignPayload): Promise<Campaign> {
  return request<Campaign>('/campaigns', {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function updateCampaign(
  token: string,
  id: string,
  payload: Partial<CampaignPayload>,
): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
}

export async function removeCampaign(token: string, id: string): Promise<void> {
  await request<void>(`/campaigns/${id}`, {
    method: 'DELETE',
    token,
  });
}
