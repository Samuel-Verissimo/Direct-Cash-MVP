import { cx } from './utils';

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AppTabBar({ tabs, value, onChange, className }: TabBarProps) {
  return (
    <div
      className={cx(
        'flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto scrollbar-none dark:bg-slate-800',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cx(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === tab.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white dark:shadow-none'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span
              className={cx(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none',
                value === tab.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-200 text-slate-500',
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
