/**
 * TODO: בורר שפה
 *
 * מציג: רשימת LANG_LABELS + LANG_FLAGS (types/i18n.types.ts)
 * לחיצה → useLanguage().setLanguage(lang)
 * RTL/LTR מתעדכן חי דרך languageStore — ללא I18nManager, ללא restart
 *
 * ב-Web: שינוי URL prefix ( /fr/prayer/... )
 */
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { APP_CONFIG } from '@/constants/app';
import { LANG_LABELS, LANG_FLAGS } from '@/types/i18n.types';
import type { SupportedLang } from '@/types/i18n.types';
import { getTextAlign, getFlexDir } from '@/utils/rtl';

export function LanguagePicker() {
  const { lang, setLanguage } = useLanguage();
  const AVAILABLE_LANGS = APP_CONFIG.SUPPORTED_LANGS.filter((l) => l === 'he' || l === 'en');

  return (
    <View>
      {AVAILABLE_LANGS.map((code: SupportedLang) => {
        const isSelected = code === lang;
        return (
          <Pressable
            key={code}
            onPress={() => setLanguage(code)}
            style={{ flexDirection: getFlexDir(lang) }}
          >
            <Text style={{ textAlign: getTextAlign(lang) }}>
              {LANG_FLAGS[code]} {LANG_LABELS[code]} {isSelected ? '✓' : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
