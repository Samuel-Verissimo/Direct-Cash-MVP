'use client';

import { locales } from '@/i18n/locales';
import { setLocaleCookie } from '@/lib/helpers/cookie';

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  function switchLocale(locale: string) {
    setLocaleCookie(locale);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
      {locales.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => switchLocale(value)}
          className={`rounded px-2 py-0.5 text-[11px] font-semibold transition ${
            currentLocale === value
              ? 'bg-white/10 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
