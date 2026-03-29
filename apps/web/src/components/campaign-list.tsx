'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppBadge, AppButton, AppEmptyState, AppTabBar } from '@/components/ui';
import type { Campaign } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { getStatusLabel, toneForStatus } from '@/features/campaigns/helpers/campaign.helpers';

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  deletingId: string | null;
  selectedCampaignId: string | null;
  onSelect: (campaign: Campaign) => void;
  onSelectAds: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

type StatusFilter = 'all' | Campaign['status'];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded-full bg-slate-100 dark:bg-slate-700" />
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700" />
        </div>
        <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-700" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-slate-700" />
        <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-700" />
        <div className="h-8 w-16 rounded-xl bg-slate-100 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export function CampaignList({
  campaigns,
  loading,
  deletingId,
  selectedCampaignId,
  onSelect,
  onSelectAds,
  onDelete,
}: CampaignListProps) {
  const t = useTranslations('CampaignList');
  const tStatus = useTranslations('Status');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const tabs = useMemo(
    () => [
      { value: 'all', label: t('tabs.all'), count: campaigns.length },
      {
        value: 'ACTIVE',
        label: t('tabs.active'),
        count: campaigns.filter((c) => c.status === 'ACTIVE').length,
      },
      {
        value: 'DRAFT',
        label: t('tabs.drafts'),
        count: campaigns.filter((c) => c.status === 'DRAFT').length,
      },
      {
        value: 'PAUSED',
        label: t('tabs.paused'),
        count: campaigns.filter((c) => c.status === 'PAUSED').length,
      },
      {
        value: 'COMPLETED',
        label: t('tabs.completed'),
        count: campaigns.filter((c) => c.status === 'COMPLETED').length,
      },
    ],
    [campaigns, t],
  );

  const filtered = useMemo(
    () => (filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter)),
    [campaigns, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('heading')}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {campaigns.length === 0 ? t('empty') : t('count', { count: campaigns.length })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <AppTabBar
        tabs={tabs}
        value={filter}
        onChange={(v) => setFilter(v as StatusFilter)}
        className="w-full overflow-x-auto"
      />

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AppEmptyState
          title={
            filter === 'all'
              ? t('emptyState.allTitle')
              : t('emptyState.filteredTitle', {
                  status: getStatusLabel(filter as Campaign['status']).toLowerCase(),
                })
          }
          description={
            filter === 'all' ? t('emptyState.allDescription') : t('emptyState.filteredDescription')
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((campaign) => {
            const isSelected = selectedCampaignId === campaign.id;
            const isDeleting = deletingId === campaign.id;
            const budgetUsed =
              Number(campaign.budget) > 0
                ? Math.min(
                    100,
                    Math.round((Number(campaign.spent) / Number(campaign.budget)) * 100),
                  )
                : 0;

            return (
              <article
                key={campaign.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(campaign)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(campaign);
                }}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-300 bg-indigo-50/60 shadow-sm ring-1 ring-indigo-200 dark:border-indigo-500 dark:bg-indigo-900/20'
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                {/* Top */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {campaign.name}
                    </h3>
                    {campaign.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {campaign.description}
                      </p>
                    ) : null}
                  </div>
                  <AppBadge tone={toneForStatus(campaign.status)} dot>
                    {tStatus(campaign.status)}
                  </AppBadge>
                </div>

                {/* Stats */}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t('stats.budget')}
                    </span>{' '}
                    {formatCurrency(campaign.budget)}
                  </span>
                  <span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t('stats.spent')}
                    </span>{' '}
                    {formatCurrency(campaign.spent)}
                  </span>
                  <span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {t('stats.period')}
                    </span>{' '}
                    {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
                  </span>
                </div>

                {/* Budget bar */}
                {Number(campaign.budget) > 0 ? (
                  <div className="mt-3">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetUsed >= 90
                            ? 'bg-rose-500'
                            : budgetUsed >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${budgetUsed}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                      {t('budgetUsed', { percent: budgetUsed })}
                    </p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAds(campaign);
                    }}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      (campaign._count?.ads ?? 0) > 0
                        ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-500'
                    }`}
                  >
                    <span aria-hidden>✦</span>
                    {(campaign._count?.ads ?? 0) > 0
                      ? t('ads.count', { count: campaign._count!.ads })
                      : t('ads.none')}
                  </button>
                  <AppButton
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(campaign);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? t('actions.deleting') : t('actions.delete')}
                  </AppButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Swagger card */}
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}/api/docs`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#49cc90]/10">
          <svg
            viewBox="0 0 32 32"
            className="h-5 w-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#49cc90" />
            <path
              d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm-1 3v2h2V11h-2zm0 4v6h2v-6h-2z"
              fill="white"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700 transition group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-400">
            {t('swagger.title')}
          </p>
          <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
            {t('swagger.subtitle')}
          </p>
        </div>
        <svg
          className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-indigo-400 dark:text-slate-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}
