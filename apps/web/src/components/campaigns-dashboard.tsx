'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { AppAlert, AppStatCard } from '@/components/ui';
import { AppHeader } from '@/components/layout/AppHeader';
import { useCampaigns } from '@/features/campaigns/hooks/use-campaigns';
import {
  createInitialDraft,
  draftFromCampaign,
  toCampaignPayload,
} from '@/features/campaigns/helpers/campaign.helpers';
import { getLocaleCookie } from '@/lib/helpers/cookie';
import { formatCurrency } from '@/lib/format';
import type { AuthUser, Campaign, CampaignFormValues } from '@/lib/types';
import { AdsGrid } from './ads-grid';
import { CampaignAds } from './campaign-ads';
import { CampaignForm } from './campaign-form';
import { CampaignList } from './campaign-list';

interface CampaignsDashboardProps {
  token: string;
  user: AuthUser;
  onLogout: (message?: string) => void;
  onRequestLogout: (message?: string) => Promise<void>;
}

type PanelState =
  | { mode: 'create' }
  | { mode: 'selected'; campaign: Campaign; tab: 'form' | 'ads' };

export function CampaignsDashboard({
  token,
  user,
  onLogout,
  onRequestLogout,
}: CampaignsDashboardProps) {
  const t = useTranslations('Dashboard');

  const {
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
    reload: loadCampaigns,
  } = useCampaigns({ token, onSessionExpired: onLogout });

  const [panel, setPanel] = useState<PanelState>({ mode: 'create' });
  const [draft, setDraft] = useState<CampaignFormValues>(createInitialDraft());
  const [adsRefreshKey, setAdsRefreshKey] = useState(0);
  const [currentLocale] = useState(getLocaleCookie);

  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const drafts = campaigns.filter((c) => c.status === 'DRAFT').length;
    const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget), 0);
    const totalSpent = campaigns.reduce((s, c) => s + Number(c.spent), 0);
    return { total: campaigns.length, active, drafts, totalBudget, totalSpent };
  }, [campaigns]);

  function updateDraft(field: keyof CampaignFormValues, value: string) {
    setDraft((p) => ({ ...p, [field]: value }));
  }

  function startEditing(campaign: Campaign) {
    setPanel({ mode: 'selected', campaign, tab: 'form' });
    setDraft(draftFromCampaign(campaign));
  }

  function startSelectingAds(campaign: Campaign) {
    setPanel({ mode: 'selected', campaign, tab: 'ads' });
    setDraft(draftFromCampaign(campaign));
  }

  function cancelEditing() {
    setPanel({ mode: 'create' });
    setDraft(createInitialDraft());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let payload;
    try {
      payload = toCampaignPayload(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dados inválidos.');
      return;
    }

    let success: boolean;
    if (panel.mode === 'selected' && panel.tab === 'form') {
      success = await update(panel.campaign.id, payload);
    } else {
      success = await create(payload);
    }

    if (success) {
      setPanel({ mode: 'create' });
      setDraft(createInitialDraft());
    }
  }

  async function handleDelete(campaign: Campaign) {
    const success = await remove(campaign);
    if (success && panel.mode === 'selected' && panel.campaign.id === campaign.id) {
      setPanel({ mode: 'create' });
      setDraft(createInitialDraft());
    }
  }

  async function handleLogout() {
    await onRequestLogout(t('session.ended'));
  }

  const selectedCampaignId = panel.mode === 'selected' ? panel.campaign.id : null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 dark:bg-slate-950">
      <AppHeader user={user} currentLocale={currentLocale} onLogout={() => void handleLogout()} />

      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <AppStatCard
              label={t('stats.campaigns')}
              value={String(stats.total)}
              hint={t('stats.activeHint', { count: stats.active })}
            />
            <AppStatCard
              label={t('stats.draft')}
              value={String(stats.drafts)}
              hint={t('stats.awaitingHint')}
            />
            <AppStatCard
              label={t('stats.budgetTotal')}
              value={formatCurrency(stats.totalBudget)}
              hint={t('stats.allCampaignsHint')}
            />
            <AppStatCard
              label={t('stats.totalSpent')}
              value={formatCurrency(stats.totalSpent)}
              hint={
                stats.totalBudget > 0
                  ? t('stats.budgetPercent', {
                      percent: Math.round((stats.totalSpent / stats.totalBudget) * 100),
                    })
                  : t('stats.noActiveCampaigns')
              }
            />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {notice ? (
          <AppAlert tone="success" className="mb-5">
            {notice}
          </AppAlert>
        ) : null}
        {error ? (
          <AppAlert tone="error" className="mb-5">
            {error}
          </AppAlert>
        ) : null}

        {panel.mode === 'selected' && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={cancelEditing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('nav.newCampaign')}
            </button>

            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              {panel.campaign.name}
            </span>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPanel({ ...panel, tab: 'form' })}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  panel.tab === 'form'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('nav.campaign')}
              </button>
              <button
                type="button"
                onClick={() => setPanel({ ...panel, tab: 'ads' })}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  panel.tab === 'ads'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t('nav.ads')}
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="order-2 lg:order-1 min-w-0">
            {panel.mode === 'selected' && panel.tab === 'ads' ? (
              <AdsGrid
                campaign={panel.campaign}
                token={token}
                refreshKey={adsRefreshKey}
                onAdsChanged={() => {
                  setAdsRefreshKey((k) => k + 1);
                  void loadCampaigns();
                }}
              />
            ) : (
              <CampaignList
                campaigns={campaigns}
                loading={loading}
                deletingId={deletingId}
                selectedCampaignId={selectedCampaignId}
                onSelect={startEditing}
                onSelectAds={startSelectingAds}
                onDelete={(c) => void handleDelete(c)}
              />
            )}
          </div>

          <aside className="order-1 lg:order-2 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:self-start dark:border-slate-700 dark:bg-slate-900">
            {panel.mode === 'selected' ? (
              panel.tab === 'form' ? (
                <CampaignForm
                  mode="edit"
                  value={draft}
                  submitting={saving}
                  token={token}
                  onChange={updateDraft}
                  onSubmit={(e) => void handleSubmit(e)}
                  onCancel={cancelEditing}
                  selectedCampaign={panel.campaign}
                />
              ) : (
                <CampaignAds
                  campaign={panel.campaign}
                  token={token}
                  onAdSaved={() => setAdsRefreshKey((k) => k + 1)}
                />
              )
            ) : (
              <CampaignForm
                mode="create"
                value={draft}
                submitting={saving}
                token={token}
                onChange={updateDraft}
                onSubmit={(e) => void handleSubmit(e)}
                onCancel={cancelEditing}
                selectedCampaign={null}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
