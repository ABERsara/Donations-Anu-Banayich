import type { SupportedLang, TextDirection } from '@/types/i18n.types';
import { RTL_LANGS } from '@/types/i18n.types';

export const isRTL = (lang: SupportedLang): boolean => RTL_LANGS.includes(lang);
export const getDirection = (lang: SupportedLang): TextDirection => (isRTL(lang) ? 'rtl' : 'ltr');
export const getTextAlign = (lang: SupportedLang): 'right' | 'left' =>
  isRTL(lang) ? 'right' : 'left';
export const getFlexDir = (lang: SupportedLang): 'row' | 'row-reverse' =>
  isRTL(lang) ? 'row-reverse' : 'row';
