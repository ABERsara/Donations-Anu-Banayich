/**
 * EXAMPLE COMPONENT — קומפוננטת דוגמא מלאה
 * ──────────────────────────────────────────
 * כרטיס תפילה ברשימה — לחיצה מנווטת ל-/prayer/:slug
 * צבעים מ-THEME (theme/colors.json), ללא hex ידני.
 */
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import type { LocalizedPrayer } from '@/types/prayer.types';
import { ROUTES } from '@/constants/routes';
import { useLanguageStore } from '@/store/languageStore';
import { THEME } from '@/constants/theme';

interface PrayerCardProps {
  prayer: LocalizedPrayer;
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  const router = useRouter();
  const { lang } = useLanguageStore();

  const handlePress = () => {
    router.push(ROUTES.PRAYER(prayer.slug, lang) as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {prayer.body}
        </Text>
      </View>
      <Text style={styles.arrow}>{'<'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row-reverse', // RTL
    backgroundColor: THEME.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  accent: {
    width: 5,
    backgroundColor: THEME.gold,
  },
  body: {
    flex: 1,
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary,
    textAlign: 'right',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    color: THEME.inkMuted,
    textAlign: 'right',
    lineHeight: 20,
  },
  arrow: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    fontSize: 18,
    color: THEME.gold,
  },
});
