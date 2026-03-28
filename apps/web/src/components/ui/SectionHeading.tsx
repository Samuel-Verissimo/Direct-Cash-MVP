import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './utils';

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  className,
  eyebrow,
  title,
  description,
  action,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-3', className)} {...props}>
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cx(
            'font-semibold tracking-tight text-slate-900 dark:text-slate-100',
            eyebrow ? 'mt-1 text-lg' : 'text-lg',
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
