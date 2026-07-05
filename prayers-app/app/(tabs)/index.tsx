import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { QuickButtons } from '@/components/QuickButtons';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';
import { LoadingSpinner } from '@/components/common';
import { PrayerCard } from '@/components/PrayerCard';
import { usePrayers } from '@/hooks/usePrayer';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { prayers, isLoading, error } = usePrayers();

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <Text style={styles.error}>{t('error.loading')}</Text>;
    return (
      <FlatList
        data={prayers}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PrayerCard prayer={item} />}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <AppDownloadBanner />
      <QuickButtons />
      {renderContent()}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  error: {
    textAlign: 'center',
    margin: 16,
  },
  list: {
    paddingBottom: 24,
  },
});
