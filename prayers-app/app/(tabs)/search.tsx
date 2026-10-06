/**
 * - Input חיפוש → GET /api/prayers/search?q=...
 * - תוצאות כ-FlatList של PrayerCard
 * - Debounce 300ms על הקלדה
 */
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { Input, LoadingSpinner } from '@/components/common';
import { useLanguage } from '@/hooks/useLanguage';
import { searchPrayers } from '@/services/api';
import type { LocalizedPrayer } from '@/types/prayer.types';
import { PrayerCard } from '@/components/PrayerCard';

export default function SearchScreen() {
  const { t, rtl, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocalizedPrayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      searchPrayers(q, lang)
        .then((data) => {
          if (cancelled) return;
          setResults(data as LocalizedPrayer[]);
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
            setHasSearched(true);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, lang]);

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
