/**
 * עמוד תפילה בשפות נוספות — /fr/prayer/health, /en/prayer/health ...
 *
 * TODO: זהה ל-app/prayer/[slug].tsx אבל:
 * 1. קורא useLanguage().changeLanguage(lang) עם ה-lang מה-URL
 * 2. hreflang מצביע על כל הגרסאות
 * 3. canonical מצביע על /prayer/:slug (עברית)
 */
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function LocalizedPrayerScreen() {
  const { lang, slug } = useLocalSearchParams<{ lang: string; slug: string }>();
  // TODO: לממש — לשאול useLanguage().changeLanguage(lang) + usePrayer(slug)
  return (
    <View>
      <Text>
        {lang}/{slug} — TODO
      </Text>
    </View>
  );
}
