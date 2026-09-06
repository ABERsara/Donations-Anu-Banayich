import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { getPrayer } from '@/services/api';
import { useDonationStore } from '@/store/donationStore';
import { useLanguageStore } from '@/store/languageStore';
import { QUICK_BUTTONS, type QuickButton } from '@/constants/quickButtons';
import { THEME } from '@/constants/theme';
import { DonationBottomSheet } from '../DonationWidget/DonationBottomSheet';
import { Currency, DonationTier, LocalizedPrayer } from '@/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
  GBP: '£',
  ARS: '$',
};
function buildTier(button: QuickButton, currency: Currency): DonationTier {
  const amount = button.defaultAmount[currency];
  return {
    amount,
    display: `${CURRENCY_SYMBOLS[currency]}${(amount / 100).toFixed(0)}`,
    label: button.slug,
  };
}

export function QuickButtons() {
  const { lang, currency } = useLanguageStore();
  const selectTier = useDonationStore((s) => s.selectTier);
  const [selectedButton, setSelectedButton] = useState<QuickButton | null>(null);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  const handlePress = async (button: QuickButton) => {
    setLoadingSlug(button.slug);
    try {
      const prayer = (await getPrayer(`${button.prayerSlug}-prayer`, lang)) as LocalizedPrayer;
      const tier = buildTier(button, currency);
      selectTier(tier);
      setSelectedPrayerId(prayer.id);
      setSelectedButton(button);
    } catch (err) {
      console.warn('Failed to load prayer for quick button:', err);
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleClose = () => {
    setSelectedButton(null);
    setSelectedPrayerId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {QUICK_BUTTONS.map((button) => (
          <TouchableOpacity
            key={button.slug}
            style={styles.button}
            onPress={() => handlePress(button)}
            activeOpacity={0.8}
            disabled={loadingSlug === button.slug}
          >
            <Text style={styles.emoji}>{button.emoji}</Text>
            <Text style={styles.label}>{button.label[lang]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedPrayerId && (
        <DonationBottomSheet
          prayerId={selectedPrayerId}
          isVisible={selectedButton !== null}
          onClose={handleClose}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    width: '18%',
    minWidth: 60,
    backgroundColor: THEME.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: THEME.ink,
    textAlign: 'center',
  },
});
