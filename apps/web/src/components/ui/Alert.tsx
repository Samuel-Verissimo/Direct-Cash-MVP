import type { HTMLAttributes } from 'react';
import { cx } from './utils';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

const alertVariants: Record<NonNullable<AlertProps['tone']>, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
  error:
    'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300',
};

export function AppAlert({ className, tone = 'info', title, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cx(
        'rounded-xl border px-4 py-3 text-sm leading-6',
        alertVariants[tone],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-0.5' : undefined}>{children}</div>
    </div>
  );
}
