import { create } from 'zustand';
import type { SupportedLang } from '@/types/i18n.types';
import type { Currency } from '@/types/donation.types';
import { isRTL } from '@/utils/rtl';

interface LanguageStore {
  lang: SupportedLang;
  currency: Currency;
  rtl: boolean;
  setLang: (lang: SupportedLang) => void;
  setCurrency: (currency: Currency) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  lang: 'he',
  currency: 'ILS',
  rtl: true,
  setLang: (lang) => set({ lang, rtl: isRTL(lang) }),
  setCurrency: (currency) => set({ currency }),
}));
