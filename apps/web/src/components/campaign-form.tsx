'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import {
  AppButton,
  AppDivider,
  AppFormHint,
  AppInput,
  AppSelect,
  AppSpinner,
  AppTextarea,
  FieldLabel,
} from '@/components/ui';
import { generateCampaignWithAI, DirectCashApiError } from '@/lib/directcash-api';
import { campaignStatusOptions } from '@/features/campaigns/constants/campaign.constants';
import { formatCurrency, formatInputDateValue, shiftDate } from '@/lib/format';
import type { Campaign, CampaignFormValues } from '@/lib/types';

interface FieldErrors {
  name?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
}

interface CampaignFormProps {
  mode: 'create' | 'edit';
  value: CampaignFormValues;
  submitting: boolean;
  token: string;
  onChange: (field: keyof CampaignFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  selectedCampaign?: Campaign | null;
}

export function CampaignForm({
  mode,
  value,
  submitting,
  token,
  onChange,
  onSubmit,
  onCancel,
  selectedCampaign,
}: CampaignFormProps) {
  const t = useTranslations('CampaignForm');
  const [touched, setTouched] = useState<Partial<Record<keyof CampaignFormValues, boolean>>>({});
  const [aiBrief, setAiBrief] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  function validate(v: CampaignFormValues): FieldErrors {
    const errors: FieldErrors = {};
    if (v.name.trim().length < 3) errors.name = t('validation.nameMin');
    const budget = Number(v.budget);
    if (!v.budget || Number.isNaN(budget) || budget <= 0)
      errors.budget = t('validation.budgetRequired');
    if (!v.startDate) errors.startDate = t('validation.startDateRequired');
    if (!v.endDate) {
      errors.endDate = t('validation.endDateRequired');
    } else if (v.startDate && new Date(v.endDate) <= new Date(v.startDate)) {
      errors.endDate = t('validation.endDateAfterStart');
    }
    return errors;
  }

  const errors = validate(value);
  const hasErrors = Object.keys(errors).length > 0;

  function touch(field: keyof CampaignFormValues) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setTouched({ name: true, budget: true, startDate: true, endDate: true });
    if (hasErrors) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  }

  async function handleGenerateWithAI() {
    if (!aiBrief.trim()) {
      setAiError(t('ai.errorEmpty'));
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiReasoning(null);

    try {
      const result = await generateCampaignWithAI(token, { brief: aiBrief });
      onChange('name', result.name);
      onChange('description', result.description);
      onChange('budget', String(result.suggestedBudget));
      const start = new Date();
      const end = shiftDate(start, result.suggestedDurationDays);
      onChange('startDate', formatInputDateValue(start));
      onChange('endDate', formatInputDateValue(end));
      setAiReasoning(result.reasoning);
    } catch (error) {
      setAiError(error instanceof DirectCashApiError ? error.message : t('ai.errorFailed'));
    } finally {
      setAiLoading(false);
    }
  }

  const isEdit = mode === 'edit';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {isEdit ? t('titleEdit') : t('titleCreate')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {isEdit ? t('subtitleEdit', { name: selectedCampaign?.name ?? '' }) : t('subtitleCreate')}
        </p>
      </div>

      {/* ── AI section (always visible on create) ──────────────────── */}
      {!isEdit ? (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-violet-950/50">
          <div className="flex items-center gap-2">
            <span className="text-base">✦</span>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
              {t('ai.title')}
            </p>
            <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              OpenAI
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-indigo-700 dark:text-indigo-400">
            {t('ai.description')}
          </p>
          <AppTextarea
            className="mt-3 border-indigo-200 bg-white/80 focus:border-indigo-400 focus:ring-indigo-400/10 dark:border-indigo-700 dark:bg-indigo-950/40"
            placeholder={t('ai.placeholder')}
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            maxLength={500}
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] text-indigo-400">{aiBrief.length}/500</span>
          </div>

          {aiError ? <p className="mt-2 text-xs text-rose-600">{aiError}</p> : null}

          {aiReasoning ? (
            <div className="mt-3 rounded-xl border border-indigo-100 bg-white/60 p-3 text-xs leading-5 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
              <span className="font-semibold">{t('ai.reasoning')}</span> {aiReasoning}
            </div>
          ) : null}

          <AppButton
            variant="ai"
            className="mt-3 w-full"
            onClick={() => void handleGenerateWithAI()}
            disabled={aiLoading || !aiBrief.trim()}
          >
            {aiLoading ? (
              <>
                <AppSpinner className="h-3.5 w-3.5" />
                {t('ai.generating')}
              </>
            ) : (
              <>
                <span>✦</span> {t('ai.generate')}
              </>
            )}
          </AppButton>
        </div>
      ) : null}

      {/* Separator */}
      {!isEdit ? <AppDivider label={t('divider')} /> : null}

      {/* ── Manual form ────────────────────────────────────────────── */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {/* Campaign being edited — info banner */}
        {isEdit && selectedCampaign ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('currentBudget')}{' '}
              <span className="text-slate-900 dark:text-slate-100">
                {formatCurrency(selectedCampaign.budget)}
              </span>
              {' · '}
              {formatInputDateValue(selectedCampaign.startDate)} →{' '}
              {formatInputDateValue(selectedCampaign.endDate)}
            </p>
          </div>
        ) : null}

        <div>
          <FieldLabel htmlFor="f-name">{t('fields.name')}</FieldLabel>
          <AppInput
            id="f-name"
            type="text"
            placeholder={t('fields.namePlaceholder')}
            value={value.name}
            onChange={(e) => onChange('name', e.target.value)}
            onBlur={() => touch('name')}
            maxLength={100}
          />
          {touched.name && errors.name ? (
            <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="f-desc" hint={t('fields.descriptionHint')}>
            {t('fields.description')}
          </FieldLabel>
          <AppTextarea
            id="f-desc"
            placeholder={t('fields.descriptionPlaceholder')}
            value={value.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="f-budget">{t('fields.budget')}</FieldLabel>
            <AppInput
              id="f-budget"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="5000.00"
              value={value.budget}
              onChange={(e) => onChange('budget', e.target.value)}
              onBlur={() => touch('budget')}
            />
            {touched.budget && errors.budget ? (
              <p className="mt-1 text-xs text-rose-600">{errors.budget}</p>
            ) : (
              <AppFormHint>{t('fields.budgetHint')}</AppFormHint>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="f-status">{t('fields.status')}</FieldLabel>
            <AppSelect
              id="f-status"
              value={value.status}
              onChange={(e) => onChange('status', e.target.value)}
            >
              {campaignStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AppSelect>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="f-start">{t('fields.startDate')}</FieldLabel>
            <AppInput
              id="f-start"
              type="date"
              value={value.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              onBlur={() => touch('startDate')}
            />
            {touched.startDate && errors.startDate ? (
              <p className="mt-1 text-xs text-rose-600">{errors.startDate}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel htmlFor="f-end">{t('fields.endDate')}</FieldLabel>
            <AppInput
              id="f-end"
              type="date"
              value={value.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              onBlur={() => touch('endDate')}
            />
            {touched.endDate && errors.endDate ? (
              <p className="mt-1 text-xs text-rose-600">{errors.endDate}</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3">
          <AppButton type="submit" className="flex-1" disabled={submitting}>
            {submitting ? t('submit.saving') : isEdit ? t('submit.save') : t('submit.create')}
          </AppButton>
          {isEdit ? (
            <AppButton variant="secondary" type="button" onClick={onCancel}>
              {t('submit.cancel')}
            </AppButton>
          ) : null}
        </div>
      </form>
    </div>
  );
}
