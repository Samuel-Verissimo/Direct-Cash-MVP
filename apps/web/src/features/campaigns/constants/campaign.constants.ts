import type { CampaignStatusOption } from '@/lib/types/campaign.types';

export const CAMPAIGN_INITIAL_BUDGET = '5000.00';
export const CAMPAIGN_INITIAL_DURATION_DAYS = 30;

export const campaignStatusOptions: CampaignStatusOption[] = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'ACTIVE', label: 'Ativa' },
  { value: 'PAUSED', label: 'Pausada' },
  { value: 'COMPLETED', label: 'Concluída' },
];
