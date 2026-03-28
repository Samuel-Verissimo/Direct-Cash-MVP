'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  removeCampaign,
  clearAccessToken,
  DirectCashApiError,
} from '@/lib/api';
import type { Campaign, CampaignPayload } from '@/lib/types';

interface UseCampaignsOptions {
  token: string;
  onSessionExpired: (message: string) => void;
}

export function useCampaigns({ token, onSessionExpired }: UseCampaignsOptions) {
  const t = useTranslations('Dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleExpired = useCallback(
    (err: unknown): boolean => {
      if (err instanceof DirectCashApiError && err.status === 401) {
        clearAccessToken();
        onSessionExpired(t('session.expired'));
        return true;
      }
      return false;
    },
    [onSessionExpired, t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCampaigns(token);
      setCampaigns(res.data);
    } catch (err) {
      if (handleExpired(err)) return;
      setError(err instanceof DirectCashApiError ? err.message : t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [token, handleExpired, t]);

  const create = useCallback(
    async (payload: CampaignPayload): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await createCampaign(token, payload);
        setNotice(t('notices.created', { name: payload.name }));
        await load();
        return true;
      } catch (err) {
        if (handleExpired(err)) return false;
        setError(
          err instanceof DirectCashApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : t('errors.saveFailed'),
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [token, load, handleExpired, t],
  );

  const update = useCallback(
    async (id: string, payload: Partial<CampaignPayload>): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        await updateCampaign(token, id, payload);
        setNotice(t('notices.updated', { name: payload.name ?? '' }));
        await load();
        return true;
      } catch (err) {
        if (handleExpired(err)) return false;
        setError(
          err instanceof DirectCashApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : t('errors.saveFailed'),
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [token, load, handleExpired, t],
  );

  const remove = useCallback(
    async (campaign: Campaign): Promise<boolean> => {
      if (!window.confirm(`Excluir "${campaign.name}"? Esta ação não pode ser desfeita.`)) {
        return false;
      }
      setDeletingId(campaign.id);
      setError(null);
      try {
        await removeCampaign(token, campaign.id);
        setNotice(t('notices.removed'));
        await load();
        return true;
      } catch (err) {
        if (handleExpired(err)) return false;
        setError(err instanceof DirectCashApiError ? err.message : t('errors.deleteFailed'));
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [token, load, handleExpired, t],
  );

  const clearNotice = useCallback(() => setNotice(null), []);
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    campaigns,
    loading,
    saving,
    deletingId,
    error,
    notice,
    setError,
    create,
    update,
    remove,
    reload: load,
    clearNotice,
    clearError,
  };
}
