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
import { useLocalSearchParams } from 'expo-router';
import { usePrayer } from '@/hooks/usePrayer';
import { LoadingSpinner } from '@/components/common';
import { DonationWidget } from '@/components/DonationWidget';

export default function PrayerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { prayer, isLoading } = usePrayer(slug);

  if (isLoading) return <LoadingSpinner />;
  if (!prayer) return <Text>לא נמצא</Text>;

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
