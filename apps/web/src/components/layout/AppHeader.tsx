'use client';

import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/ui';
import type { AuthUser } from '@/lib/types/auth.types';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  user: AuthUser;
  currentLocale: string;
  onLogout: () => void;
}

export function AppHeader({ user, currentLocale, onLogout }: AppHeaderProps) {
  const t = useTranslations('Dashboard');

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <span className="text-xs font-bold text-white">DC</span>
          </div>
          <span className="text-sm font-semibold text-white">DirectCash</span>
          <span className="hidden rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/40 sm:inline">
            MVP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-xs text-slate-400 sm:block">
            {user.email}
          </span>
          <LocaleSwitcher currentLocale={currentLocale} />
          <ThemeToggle />
          <AppButton
            variant="ghost"
            size="sm"
            className="border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={onLogout}
          >
            {t('logout')}
          </AppButton>
        </div>
      </div>
    </header>
  );
}
