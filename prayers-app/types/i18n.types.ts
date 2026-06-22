export type SupportedLang = 'he' | 'en' | 'fr' | 'ru' | 'es' | 'ar';
export type TextDirection = 'rtl' | 'ltr';

export const RTL_LANGS: SupportedLang[] = ['he', 'ar'];

export const LANG_LABELS: Record<SupportedLang, string> = {
  he: 'עברית',
  en: 'English',
  fr: 'Français',
  ru: 'Русский',
  es: 'Español',
  ar: 'العربية',
};

export const LANG_FLAGS: Record<SupportedLang, string> = {
  he: '🇮🇱',
  en: '🇺🇸',
  fr: '🇫🇷',
  ru: '🇷🇺',
  es: '🇦🇷',
  ar: '🕌',
};

export function getDirection(lang: SupportedLang): TextDirection {
  return RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}

export function isRTL(lang: SupportedLang): boolean {
  return RTL_LANGS.includes(lang);
}
