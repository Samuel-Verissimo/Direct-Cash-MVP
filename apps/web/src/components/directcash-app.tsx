'use client';

import { useTranslations } from 'next-intl';
import { AppSpinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AuthPanel } from './auth-panel';
import { CampaignsDashboard } from './campaigns-dashboard';

export function DirectCashApp() {
  const t = useTranslations('App');
  const { session, login, logout, forceLogout } = useAuth();

  if (session.status === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <AppSpinner className="h-4 w-4 text-indigo-600" />
          {t('loading')}
        </div>
      </div>
    );
  }

  if (session.status === 'authenticated' && session.token && session.user) {
    return (
      <CampaignsDashboard
        token={session.token}
        user={session.user}
        onLogout={forceLogout}
        onRequestLogout={logout}
      />
    );
  }

  return <AuthPanel onAuthenticated={login} initialMessage={session.message} />;
}
