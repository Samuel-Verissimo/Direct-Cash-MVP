'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchAds, removeAd, toggleAdActive } from '@/lib/directcash-api';
import { FORMAT_LABELS, FORMAT_GRADIENT } from '@/features/ads/constants/ad.constants';
import type { Ad, AdFormat, Campaign } from '@/lib/types';

interface AdsGridProps {
  campaign: Campaign;
  token: string;
  refreshKey: number;
  onAdsChanged: () => void;
}

type AdActionState = {
  toggling: boolean;
  deleting: boolean;
  actionError: string | null;
};

function BannerIcon() {
  return (
    <svg
      className="h-10 w-10 opacity-80"
      viewBox="0 0 40 40"
      fill="none"
      stroke="white"
      strokeWidth={2}
    >
      <rect x="4" y="10" width="32" height="20" rx="2" />
      <line x1="4" y1="17" x2="36" y2="17" />
      <line x1="8" y1="22" x2="24" y2="22" />
      <line x1="8" y1="26" x2="18" y2="26" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="h-10 w-10 opacity-80" viewBox="0 0 40 40" fill="white">
      <path d="M15 12l16 8-16 8V12z" />
    </svg>
  );
}

function CarouselIcon() {
  return (
    <svg
      className="h-10 w-10 opacity-80"
      viewBox="0 0 40 40"
      fill="none"
      stroke="white"
      strokeWidth={2}
    >
      <rect x="2" y="12" width="9" height="16" rx="1.5" />
      <rect x="15" y="9" width="10" height="22" rx="1.5" />
      <rect x="29" y="12" width="9" height="16" rx="1.5" />
    </svg>
  );
}

function NativeIcon() {
  return (
    <svg
      className="h-10 w-10 opacity-80"
      viewBox="0 0 40 40"
      fill="none"
      stroke="white"
      strokeWidth={2}
    >
      <rect x="6" y="6" width="28" height="28" rx="2" />
      <line x1="11" y1="14" x2="29" y2="14" />
      <line x1="11" y1="20" x2="29" y2="20" />
      <line x1="11" y1="26" x2="22" y2="26" />
    </svg>
  );
}

const FORMAT_ICON: Record<AdFormat, React.ReactElement> = {
  BANNER: <BannerIcon />,
  VIDEO: <VideoIcon />,
  CAROUSEL: <CarouselIcon />,
  NATIVE: <NativeIcon />,
};

function defaultAdState(): AdActionState {
  return { toggling: false, deleting: false, actionError: null };
}

interface AdPreviewCardProps {
  ad: Ad;
  state: AdActionState;
  onToggle: (ad: Ad) => Promise<void>;
  onDelete: (ad: Ad) => Promise<void>;
}

function AdPreviewCard({ ad, state, onToggle, onDelete }: AdPreviewCardProps) {
  const t = useTranslations('AdsGrid');

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-800">
      <div
        className={`h-28 flex items-center justify-center relative ${FORMAT_GRADIENT[ad.format]}`}
      >
        {FORMAT_ICON[ad.format]}
        <div className="absolute top-2 right-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              ad.isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-white/80'
            }`}
          >
            {ad.isActive ? t('status.active') : t('status.paused')}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
            {FORMAT_LABELS[ad.format]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug dark:text-slate-100">
            {ad.title}
          </h3>
          {ad.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed dark:text-slate-400">
              {ad.description}
            </p>
          )}
          <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 truncate"
          >
            <svg
              className="h-3 w-3 shrink-0"
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
            <span className="truncate">{ad.targetUrl}</span>
          </a>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            {t('metrics', { impressions: ad.impressions, clicks: ad.clicks })}
          </div>
          {state.actionError && <p className="text-[10px] text-rose-600">{state.actionError}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => void onToggle(ad)}
            disabled={state.toggling || state.deleting}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
              ad.isActive
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
            }`}
          >
            {state.toggling ? '...' : ad.isActive ? t('actions.pause') : t('actions.activate')}
          </button>
          <button
            onClick={() => void onDelete(ad)}
            disabled={state.toggling || state.deleting}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            {state.deleting ? '...' : t('actions.delete')}
          </button>
        </div>
      </div>
    </article>
  );
}

export function AdsGrid({ campaign, token, refreshKey, onAdsChanged }: AdsGridProps) {
  const t = useTranslations('AdsGrid');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adStates, setAdStates] = useState<Record<string, AdActionState>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAds(token, campaign.id);
        if (!cancelled) {
          setAds(result);
          setAdStates({});
        }
      } catch {
        if (!cancelled) {
          setError(t('errors.load'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, campaign.id, refreshKey, t]);

  function patchAdState(id: string, patch: Partial<AdActionState>) {
    setAdStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultAdState()), ...patch },
    }));
  }

  async function handleToggle(ad: Ad) {
    patchAdState(ad.id, { toggling: true, actionError: null });

    try {
      const updated = await toggleAdActive(token, campaign.id, ad.id, !ad.isActive);
      setAds((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
      patchAdState(ad.id, { toggling: false });
      onAdsChanged();
    } catch {
      patchAdState(ad.id, { toggling: false, actionError: t('errors.toggle') });
    }
  }

  async function handleDelete(ad: Ad) {
    if (!window.confirm(`Excluir o anúncio "${ad.title}"? Esta ação não pode ser desfeita.`))
      return;

    patchAdState(ad.id, { deleting: true, actionError: null });

    try {
      await removeAd(token, campaign.id, ad.id);
      setAds((prev) => prev.filter((a) => a.id !== ad.id));
      onAdsChanged();
    } catch {
      patchAdState(ad.id, { deleting: false, actionError: t('errors.delete') });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t('heading')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
            {t('subtitle', { name: campaign.name, count: ads.length })}
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-slate-100 h-64 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
          <div className="text-3xl mb-3">✦</div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('empty.title')}
          </p>
          <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">
            {t('empty.description')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <AdPreviewCard
              key={ad.id}
              ad={ad}
              state={adStates[ad.id] ?? defaultAdState()}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
