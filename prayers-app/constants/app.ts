import type { SupportedLang } from '@/types/i18n.types';
import type { Currency } from '@/types/donation.types';

export const APP_CONFIG = {
  NAME: 'תפילות',
  VERSION: '1.0.0',
  DEFAULT_LANG: 'he' as SupportedLang,
  SUPPORTED_LANGS: ['he', 'en', 'fr', 'ru', 'es', 'ar'] as SupportedLang[],
  RTL_LANGS: ['he', 'ar'] as SupportedLang[],
  DEFAULT_CURRENCY: 'ILS' as Currency,
  /** למלא לאחר פרסום באפ סטור */
  APPLE_STORE_URL: 'https://apps.apple.com/app/id_REPLACE_ME',
  GOOGLE_PLAY_URL: 'https://play.google.com/store/apps/details?id=com.yourorg.prayersapp',
} as const;
