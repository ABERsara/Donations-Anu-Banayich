import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import he from './he.json';
import en from './en.json';
import fr from './fr.json';
import ru from './ru.json';
import es from './es.json';
import ar from './ar.json';

import type { SupportedLang } from '@/types/i18n.types';
import { APP_CONFIG } from '@/constants/app';
import { STORAGE_KEYS } from '@/constants/storage';

// TODO: החלף AsyncStorage ב-expo-secure-store אם נדרש
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESOURCES = {
  he: { translation: he },
  en: { translation: en },
  fr: { translation: fr },
  ru: { translation: ru },
  es: { translation: es },
  ar: { translation: ar },
};

/** בחירת שפה ראשונית לפי עדיפויות */
async function detectInitialLang(): Promise<SupportedLang> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.PREFERRED_LANG);
  if (saved && APP_CONFIG.SUPPORTED_LANGS.includes(saved as SupportedLang)) {
    return saved as SupportedLang;
  }
  const device = Localization.locale.split('-')[0] as SupportedLang;
  if (APP_CONFIG.SUPPORTED_LANGS.includes(device)) return device;
  return APP_CONFIG.DEFAULT_LANG;
}

export async function initI18n() {
  const lng = await detectInitialLang();
  await i18n.use(initReactI18next).init({
    resources: RESOURCES,
    lng,
    fallbackLng: 'he',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
