/**
 * עמוד תפילה — SSR לצורך SEO
 * URL: /prayer/:slug  (עברית — ברירת מחדל)
 *
 * TODO:
 * 1. generateMetadata() עם title, description, keywords, hreflang
 * 2. JSON-LD schema.org/Article
 * 3. usePrayer(slug) לשליפת הנתונים
 * 4. DonationWidget + QuickButtons ב-sticky bottom bar
 * 5. "תפילות קשורות" בתחתית
 */
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { usePrayer } from '@/hooks/usePrayer';
import { LoadingSpinner, Button } from '@/components/common';
import { DonationWidget } from '@/components/DonationWidget';

export default function PrayerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { prayer, isLoading, error } = usePrayer(slug);
  const { t } = useTranslation();
  const router = useRouter();

  if (isLoading) return <LoadingSpinner />;
  if (error || !prayer)
    return (
      <View>
        <Text>{t('prayer.not_found')}</Text>
        <Button onPress={() => router.back()} label={t('common.back')} />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>{prayer.title}</Text>
        <Text style={{ lineHeight: 28 }}>{prayer.body}</Text>
        {/* TODO: JSON-LD, SEO meta */}
      </ScrollView>

      {/* Sticky bottom */}
      <DonationWidget prayerId={prayer.id} />
    </View>
  );
}
