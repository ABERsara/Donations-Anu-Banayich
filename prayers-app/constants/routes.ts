import type { SupportedLang } from '@/types/i18n.types';
import type { PrayerSlug } from '@/types/prayer.types';

export const ROUTES = {
  HOME: '/' as const,
  SEARCH: '/search' as const,
  PROFILE: '/profile' as const,
  MY_DONATIONS: '/profile/donations' as const,
  SETTINGS: '/settings' as const,
  LOGIN: '/auth/login' as const,
  REGISTER: '/auth/register' as const,

  /** /prayer/health  או  /fr/prayer/health */
  PRAYER: (slug: PrayerSlug, lang: SupportedLang = 'he'): string =>
    lang === 'he' ? `/prayer/${slug}` : `/${lang}/prayer/${slug}`,
} as const;
