import type { HTMLAttributes } from 'react';
import { cx } from './utils';

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'inverse';
}

export function AppStatCard({
  className,
  label,
  value,
  hint,
  tone = 'default',
  ...props
}: StatCardProps) {
  const inv = tone === 'inverse';

  return (
    <div
      className={cx(
        'rounded-xl border p-4',
        inv
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
      {...props}
    >
      <p className={cx('text-xs font-medium', inv ? 'text-white/60' : 'text-slate-500')}>{label}</p>
      <p
        className={cx(
          'mt-1.5 text-2xl font-semibold tracking-tight',
          inv ? 'text-white' : 'text-slate-900 dark:text-white',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className={cx('mt-1 text-xs', inv ? 'text-white/50' : 'text-slate-400')}>{hint}</p>
      ) : null}
    </div>
  );
}
