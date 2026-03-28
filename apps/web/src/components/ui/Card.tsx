import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  tone?: 'default' | 'dark' | 'subtle';
}

const cardVariants: Record<NonNullable<CardProps['tone']>, string> = {
  default:
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700',
  dark: 'rounded-2xl border border-slate-800 bg-slate-950',
  subtle: 'rounded-2xl border border-slate-100 bg-slate-50 dark:bg-slate-900 dark:border-slate-800',
};

export function AppCard({ className, padded = true, tone = 'default', ...props }: CardProps) {
  return <div className={cx(cardVariants[tone], padded && 'p-5', className)} {...props} />;
}

interface AppCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
}

export function AppCardHeader({ className, action, children, ...props }: AppCardHeaderProps) {
  return (
    <div
      className={cx(
        'flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-700',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
