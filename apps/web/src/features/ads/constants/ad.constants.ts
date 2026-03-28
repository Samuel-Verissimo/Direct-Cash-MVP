import type { AdFormat } from '@/lib/types/ad.types';

export const FORMAT_LABELS: Record<AdFormat, string> = {
  BANNER: 'Banner',
  VIDEO: 'Vídeo',
  CAROUSEL: 'Carrossel',
  NATIVE: 'Nativo',
};

export const FORMAT_BADGE_COLORS: Record<AdFormat, string> = {
  BANNER: 'bg-sky-100 text-sky-700',
  VIDEO: 'bg-rose-100 text-rose-700',
  CAROUSEL: 'bg-violet-100 text-violet-700',
  NATIVE: 'bg-amber-100 text-amber-700',
};

export const FORMAT_GRADIENT: Record<AdFormat, string> = {
  BANNER: 'bg-gradient-to-br from-sky-400 to-blue-600',
  VIDEO: 'bg-gradient-to-br from-rose-400 to-red-600',
  CAROUSEL: 'bg-gradient-to-br from-violet-400 to-purple-600',
  NATIVE: 'bg-gradient-to-br from-amber-400 to-orange-500',
};
