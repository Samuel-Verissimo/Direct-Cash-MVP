export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  budget: string;
  spent: string;
  startDate: string;
  endDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { ads: number };
}

export interface CampaignPage {
  data: Campaign[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CampaignFormValues {
  name: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
}

export interface CampaignPayload {
  name: string;
  description?: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: CampaignStatus;
}

export interface CampaignStatusOption {
  value: CampaignStatus;
  label: string;
}
