'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { AppAlert, AppButton, AppInput, AppSpinner, FieldLabel } from '@/components/ui';
import {
  type AuthSession,
  DirectCashApiError,
  loginUser,
  registerUser,
} from '@/lib/directcash-api';
import { LocaleSwitcher } from './locale-switcher';
import { EMAIL_REGEX } from '@/features/auth/helpers/auth.helpers';
import { getLocaleCookie } from '@/lib/helpers/cookie';

type AuthMode = 'login' | 'register';

interface AuthPanelProps {
  onAuthenticated: (session: AuthSession) => void;
  initialMessage?: string | null;
}

interface AuthFormState {
  name: string;
  email: string;
  password: string;
}

const emptyForm: AuthFormState = { name: '', email: '', password: '' };

export function AuthPanel({ onAuthenticated, initialMessage }: AuthPanelProps) {
  const t = useTranslations('Auth');
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<AuthFormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(initialMessage ?? null);
  const [touched, setTouched] = useState<Partial<Record<keyof AuthFormState, boolean>>>({});
  const [currentLocale, setCurrentLocale] = useState('pt-br');

  useEffect(() => {
    setCurrentLocale(getLocaleCookie());
  }, []);

  function validateForm(
    m: AuthMode,
    f: AuthFormState,
  ): Partial<Record<keyof AuthFormState, string>> {
    const errors: Partial<Record<keyof AuthFormState, string>> = {};
    if (m === 'register' && f.name.trim().length < 2) errors.name = t('validation.nameMin');
    if (f.email && !EMAIL_REGEX.test(f.email)) errors.email = t('validation.emailInvalid');
    if (f.password && f.password.length < 8) errors.password = t('validation.passwordMin');
    return errors;
  }

  const fieldErrors = validateForm(mode, form);

  function touch(field: keyof AuthFormState): void {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function updateField(field: keyof AuthFormState, value: string): void {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function switchMode(next: AuthMode): void {
    setMode(next);
    setForm(emptyForm);
    setTouched({});
    setApiError(next === 'login' ? (initialMessage ?? null) : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const allTouched: Partial<Record<keyof AuthFormState, boolean>> = {
      email: true,
      password: true,
    };
    if (mode === 'register') allTouched.name = true;
    setTouched(allTouched);

    if (Object.keys(validateForm(mode, form)).length > 0) return;

    setLoading(true);
    setApiError(null);

    try {
      const session =
        mode === 'login'
          ? await loginUser({ email: form.email, password: form.password })
          : await registerUser({ email: form.email, name: form.name, password: form.password });

      onAuthenticated(session);
      setForm(emptyForm);
    } catch (error) {
      setApiError(error instanceof DirectCashApiError ? error.message : t('errors.authFailed'));
    } finally {
      setLoading(false);
    }
  }

  const features = [
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      text: t('features.manage'),
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: t('features.ai'),
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      text: t('features.track'),
    },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-50 lg:flex-row dark:bg-slate-950">
      {/* ── Left hero panel ──────────────────────────────────────────── */}
      <div className="relative flex lg:flex-1 flex-col justify-between overflow-hidden bg-slate-950 px-8 py-12 lg:px-12 lg:py-16">
        {/* Subtle gradient orb */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-[360px] w-[360px] rounded-full bg-violet-600/15 blur-[100px]"
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">DC</span>
          </div>
          <span className="text-sm font-semibold text-white">DirectCash</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/40">
            MVP
          </span>
        </div>

        {/* Headline */}
        <div className="relative mt-12 lg:mt-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">{t('hero.subtitle')}</p>

          {/* Features */}
          <ul className="mt-8 space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-indigo-400">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <div className="relative mt-12 flex items-center justify-between lg:mt-0">
          <p className="text-xs text-slate-600">{t('hero.footerNote')}</p>
          <LocaleSwitcher currentLocale={currentLocale} />
        </div>
      </div>

      {/* ── Right auth panel ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12 lg:w-[42%] lg:flex-none lg:px-10">
        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {m === 'login' ? t('tabs.login') : t('tabs.register')}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {mode === 'login' ? t('login.title') : t('register.title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? t('login.subtitle') : t('register.subtitle')}
            </p>
          </div>

          {/* API error */}
          {apiError ? (
            <AppAlert tone="error" className="mt-5">
              {apiError}
            </AppAlert>
          ) : null}

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === 'register' ? (
              <div>
                <FieldLabel htmlFor="auth-name">{t('fields.fullName')}</FieldLabel>
                <AppInput
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder={t('fields.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  onBlur={() => touch('name')}
                />
                {touched.name && fieldErrors.name ? (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
                ) : null}
              </div>
            ) : null}

            <div>
              <FieldLabel htmlFor="auth-email">{t('fields.email')}</FieldLabel>
              <AppInput
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('fields.emailPlaceholder')}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => touch('email')}
              />
              {touched.email && fieldErrors.email ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div>
              <FieldLabel htmlFor="auth-password">{t('fields.password')}</FieldLabel>
              <AppInput
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={
                  mode === 'login'
                    ? t('fields.passwordPlaceholderLogin')
                    : t('fields.passwordPlaceholderRegister')
                }
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                onBlur={() => touch('password')}
              />
              {touched.password && fieldErrors.password ? (
                <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>
              ) : null}
            </div>

            <AppButton type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? (
                <>
                  <AppSpinner className="h-3.5 w-3.5" />
                  {mode === 'login' ? t('login.submitting') : t('register.submitting')}
                </>
              ) : mode === 'login' ? (
                t('login.submit')
              ) : (
                t('register.submit')
              )}
            </AppButton>
          </form>

          {/* Hint */}
          {mode === 'login' ? (
            <p className="mt-6 text-center text-xs text-slate-400">
              {t('login.noAccount')}{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('login.signUpLink')}
              </button>
            </p>
          ) : (
            <p className="mt-6 text-center text-xs text-slate-400">
              {t('register.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('register.loginLink')}
              </button>
            </p>
          )}

          {/* Demo account */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t('demo.label')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              admin@directcash.com · Admin@123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
