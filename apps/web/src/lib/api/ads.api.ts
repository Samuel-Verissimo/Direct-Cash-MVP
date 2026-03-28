import { request } from './client';
import type { Ad, CreateAdPayload } from '../types/ad.types';

export async function fetchAds(token: string, campaignId: string): Promise<Ad[]> {
  return request<Ad[]>(`/campaigns/${campaignId}/ads`, {
    method: 'GET',
    token,
  });
}

export async function createAd(
  token: string,
  campaignId: string,
  payload: CreateAdPayload,
): Promise<Ad> {
  return request<Ad>(`/campaigns/${campaignId}/ads`, {
    method: 'POST',
    token,
    body: payload,
  });
}

export async function removeAd(token: string, campaignId: string, adId: string): Promise<void> {
  await request<void>(`/campaigns/${campaignId}/ads/${adId}`, {
    method: 'DELETE',
    token,
  });
}

export async function toggleAdActive(
  token: string,
  campaignId: string,
  adId: string,
  isActive: boolean,
): Promise<Ad> {
  return request<Ad>(`/campaigns/${campaignId}/ads/${adId}`, {
    method: 'PATCH',
    token,
    body: { isActive },
  });
}
