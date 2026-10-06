/**
 * - Input חיפוש → GET /api/prayers/search?q=...
 * - תוצאות כ-FlatList של PrayerCard
 */
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { Input, LoadingSpinner } from '@/components/common';
import { useLanguage } from '@/hooks/useLanguage';
import { PrayerCard } from '@/components/PrayerCard';
import { useSearch } from '@/hooks/usePrayer';

export default function SearchScreen() {
  const { t, rtl, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const { results, isLoading, error, hasSearched } = useSearch(query, lang);

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <Text style={styles.message}>{t('error.loading')}</Text>;
    if (hasSearched && results.length === 0) {
      return <Text style={styles.message}>{t('search.empty')}</Text>;
    }
    return (
      <FlatList
        data={results}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PrayerCard prayer={item} />}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.inputWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          accessibilityLabel={t('search.placeholder')}
          rtl={rtl}
        />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  inputWrap: {
    padding: 16,
  },
  message: {
    textAlign: 'center',
    margin: 16,
  },
});
