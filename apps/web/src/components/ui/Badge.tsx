import type { HTMLAttributes } from 'react';
import { cx } from './utils';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const badgeVariants: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  info: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  purple: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

const dotVariants: Record<BadgeTone, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  purple: 'bg-violet-500',
};

export function AppBadge({
  className,
  tone = 'neutral',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        badgeVariants[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className={cx('h-1.5 w-1.5 rounded-full', dotVariants[tone])} /> : null}
      {children}
    </span>
  );
}
