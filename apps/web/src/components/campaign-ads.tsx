'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppButton, AppDivider, AppSelect, AppSpinner } from '@/components/ui';
import { createAd, generateAdsWithAI, DirectCashApiError } from '@/lib/directcash-api';
import { FORMAT_LABELS, FORMAT_BADGE_COLORS } from '@/features/ads/constants/ad.constants';
import type { AdFormat, Campaign, GeneratedAd } from '@/lib/types';

interface CampaignAdsProps {
  campaign: Campaign;
  token: string;
  onAdSaved: () => void;
}

type DraftAd = GeneratedAd & {
  uid: string;
  targetUrl: string;
  saving: boolean;
  saveError: string | null;
};

function FormatBadge({ format }: { format: AdFormat }) {
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${FORMAT_BADGE_COLORS[format]}`}
    >
      {FORMAT_LABELS[format]}
    </span>
  );
}

export function CampaignAds({ campaign, token, onAdSaved }: CampaignAdsProps) {
  const t = useTranslations('CampaignAds');
  const [draftAds, setDraftAds] = useState<DraftAd[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [count, setCount] = useState(3);
  const [format, setFormat] = useState<'' | AdFormat>('');

  const formatOptions: { value: '' | AdFormat; label: string }[] = [
    { value: '', label: t('format.auto') },
    { value: 'BANNER', label: 'Banner' },
    { value: 'VIDEO', label: 'Vídeo' },
    { value: 'CAROUSEL', label: 'Carrossel' },
    { value: 'NATIVE', label: 'Nativo' },
  ];

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setDraftAds([]);

    try {
      const result = await generateAdsWithAI(token, {
        campaignName: campaign.name,
        campaignDescription: campaign.description ?? campaign.name,
        format: format || undefined,
        count,
      });
      setDraftAds(
        result.map((ad) => ({
          ...ad,
          uid: crypto.randomUUID(),
          saving: false,
          saveError: null,
        })),
      );
    } catch (err) {
      setGenError(err instanceof DirectCashApiError ? err.message : t('ai.errorFailed'));
    } finally {
      setGenerating(false);
    }
  }

  function updateDraftTargetUrl(uid: string, value: string) {
    setDraftAds((prev) => prev.map((d) => (d.uid === uid ? { ...d, targetUrl: value } : d)));
  }

  async function saveSingleDraft(draft: DraftAd) {
    setDraftAds((prev) =>
      prev.map((d) => (d.uid === draft.uid ? { ...d, saving: true, saveError: null } : d)),
    );

    try {
      await createAd(token, campaign.id, {
        title: draft.title,
        description: draft.description ?? undefined,
        targetUrl: draft.targetUrl,
        format: draft.format,
      });

      setDraftAds((prev) => prev.filter((d) => d.uid !== draft.uid));
      onAdSaved();
    } catch (err) {
      const message = err instanceof DirectCashApiError ? err.message : t('ai.errorSave');
      setDraftAds((prev) =>
        prev.map((d) => (d.uid === draft.uid ? { ...d, saving: false, saveError: message } : d)),
      );
    }
  }

  async function saveAllDrafts() {
    const snapshot = [...draftAds];
    for (const draft of snapshot) {
      await saveSingleDraft(draft);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Geração IA */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-3 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-violet-950/50">
        <div className="flex items-center">
          <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
            {t('ai.title')}
          </span>
          <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            OpenAI
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition ${
                count === n
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          ))}

          <AppSelect
            value={format}
            onChange={(e) => setFormat(e.target.value as '' | AdFormat)}
            className="mt-0 flex-1 py-1 text-xs"
          >
            {formatOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AppSelect>

          <AppButton
            variant="ai"
            size="sm"
            onClick={() => void handleGenerate()}
            disabled={generating}
          >
            {generating ? (
              <>
                <AppSpinner className="h-3 w-3" />
                {t('ai.generating')}
              </>
            ) : (
              <>{t('ai.generate', { count })}</>
            )}
          </AppButton>
        </div>

        {genError ? <p className="mt-2 text-xs text-rose-600">{genError}</p> : null}
      </div>

      {/* 2. Drafts gerados */}
      {draftAds.length > 0 ? (
        <div>
          <AppDivider label={t('drafts.divider', { count: draftAds.length })} className="mb-3" />

          {draftAds.length > 1 ? (
            <AppButton
              variant="primary"
              size="sm"
              className="mb-3 w-full"
              onClick={() => void saveAllDrafts()}
            >
              {t('drafts.saveAll')}
            </AppButton>
          ) : null}

          <div className="space-y-2">
            {draftAds.map((draft) => (
              <div
                key={draft.uid}
                className="space-y-1.5 rounded-xl border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-800/50 dark:bg-amber-950/20"
              >
                <div className="flex items-center gap-2">
                  <FormatBadge format={draft.format} />
                  <span className="text-sm font-semibold text-slate-900 leading-tight line-clamp-2 dark:text-slate-100">
                    {draft.title}
                  </span>
                </div>

                {draft.description ? (
                  <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {draft.description}
                  </p>
                ) : null}

                <div>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {t('drafts.urlLabel')}
                  </p>
                  <input
                    type="url"
                    value={draft.targetUrl}
                    onChange={(e) => updateDraftTargetUrl(draft.uid, e.target.value)}
                    placeholder={t('drafts.urlPlaceholder')}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-500"
                  />
                </div>

                {draft.saveError ? (
                  <p className="text-xs text-rose-600">{draft.saveError}</p>
                ) : null}

                <AppButton
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => void saveSingleDraft(draft)}
                  disabled={draft.saving}
                >
                  {draft.saving ? (
                    <>
                      <AppSpinner className="h-3 w-3" />
                      {t('drafts.saving')}
                    </>
                  ) : (
                    t('drafts.save')
                  )}
                </AppButton>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
