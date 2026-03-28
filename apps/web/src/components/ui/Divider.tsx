import { cx } from './utils';

interface DividerProps {
  label?: string;
  className?: string;
}

export function AppDivider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cx('border-slate-200 dark:border-slate-700', className)} />;
  }

  return (
    <div className={cx('flex items-center gap-3', className)}>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
