import { formatInputDateValue, shiftDate } from '@/lib/format';
import type { Campaign, CampaignFormValues, CampaignPayload, CampaignStatus } from '@/lib/types';
import {
  campaignStatusOptions,
  CAMPAIGN_INITIAL_BUDGET,
  CAMPAIGN_INITIAL_DURATION_DAYS,
} from '../constants/campaign.constants';

export function createInitialDraft(): CampaignFormValues {
  const today = new Date();
  return {
    name: '',
    description: '',
    budget: CAMPAIGN_INITIAL_BUDGET,
    startDate: formatInputDateValue(today),
    endDate: formatInputDateValue(shiftDate(today, CAMPAIGN_INITIAL_DURATION_DAYS)),
    status: 'DRAFT',
  };
}

export function draftFromCampaign(campaign: Campaign): CampaignFormValues {
  return {
    name: campaign.name,
    description: campaign.description ?? '',
    budget: Number(campaign.budget).toFixed(2),
    startDate: formatInputDateValue(campaign.startDate),
    endDate: formatInputDateValue(campaign.endDate),
    status: campaign.status,
  };
}

export function toCampaignPayload(draft: CampaignFormValues): CampaignPayload {
  const startDate = new Date(draft.startDate);
  const endDate = new Date(draft.endDate);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error('Datas inválidas.');
  }
  if (endDate <= startDate) {
    throw new Error('A data final precisa ser posterior à inicial.');
  }

  const budget = Number(draft.budget);
  if (Number.isNaN(budget) || budget <= 0) {
    throw new Error('O orçamento precisa ser maior que zero.');
  }

  return {
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    budget,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: draft.status,
  };
}

export function getStatusLabel(status: CampaignStatus): string {
  return campaignStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

export function toneForStatus(
  status: CampaignStatus,
): 'neutral' | 'success' | 'warning' | 'info' | 'purple' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    case 'COMPLETED':
      return 'info';
    case 'DRAFT':
      return 'purple';
    default:
      return 'neutral';
  }
}
