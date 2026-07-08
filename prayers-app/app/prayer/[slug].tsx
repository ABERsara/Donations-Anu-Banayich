/**
 * עמוד תפילה — SSR לצורך SEO
 * URL: /prayer/:slug  (עברית — ברירת מחדל)
 *
 * TODO:
 * 1. generateMetadata() עם title, description, keywords, hreflang
 * 2. JSON-LD schema.org/Article
 * 5. "תפילות קשורות" בתחתית
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
      <View style={styles.notFound}>
        <Text>{t('prayer.not_found')}</Text>
        <Button
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          label={t('common.back')}
        />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.body}>{prayer.body}</Text>
        {/* TODO: JSON-LD, SEO meta */}
      </ScrollView>

      {/* Sticky bottom */}
      <DonationWidget prayerId={prayer.id} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    lineHeight: 28,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
