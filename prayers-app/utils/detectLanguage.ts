import * as Localization from 'expo-localization';
import type { SupportedLang } from '@/types/i18n.types';
import { APP_CONFIG } from '@/constants/app';

const TZ_MAP: Record<string, SupportedLang> = {
  Jerusalem: 'he',
  Tel_Aviv: 'he',
  Paris: 'fr',
  Algiers: 'fr',
  Casablanca: 'fr',
  Moscow: 'ru',
  Kiev: 'ru',
  Buenos_Aires: 'es',
  Mexico_City: 'es',
};

export function detectPreferredLanguage(): SupportedLang {
  const device = Localization.locale.split('-')[0] as SupportedLang;
  if (APP_CONFIG.SUPPORTED_LANGS.includes(device)) return device;

  const tz = Localization.timezone ?? '';
  for (const [key, lang] of Object.entries(TZ_MAP)) {
    if (tz.includes(key)) return lang;
  }
  return APP_CONFIG.DEFAULT_LANG;
}
