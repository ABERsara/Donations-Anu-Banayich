import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

import { QuickButtons } from '@/components/QuickButtons';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';
import { LoadingSpinner } from '@/components/common';
import { PrayerCard } from '@/components/PrayerCard';
import { usePrayers } from '@/hooks/usePrayer';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { prayers, isLoading, error } = usePrayers();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <Text>{t('error.loading')}</Text>;

  return (
    <View style={{ flex: 1 }}>
      <AppDownloadBanner />
      <QuickButtons />
      <FlatList
        data={prayers}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PrayerCard prayer={item} />}
      />
    </View>
  );
}
