export const locales = [
  { value: 'pt-br', label: 'PT' },
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
] as const;

export type Locale = (typeof locales)[number]['value'];

export const defaultLocale: Locale = 'pt-br';

export const localeValues = locales.map((l) => l.value);
