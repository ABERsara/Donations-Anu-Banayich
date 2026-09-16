/**
 * EXAMPLE HOOK — דוגמא מלאה לשאר ה-hooks
 * ────────────────────────────────────────
 * משתמשת ב: languageStore + i18next
 * מחזירה: lang, rtl, setLang, t (translate fn)
 */
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/languageStore';
import type { SupportedLang } from '@/types/i18n.types';
import { STORAGE_KEYS } from '@/constants/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n';

export function useLanguage() {
  const { t } = useTranslation();
  const { lang, rtl, setLang } = useLanguageStore();

  const changeLanguage = async (newLang: SupportedLang) => {
    setLang(newLang);
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.PREFERRED_LANG, newLang);
  };

  return { lang, rtl, t, changeLanguage };
}
