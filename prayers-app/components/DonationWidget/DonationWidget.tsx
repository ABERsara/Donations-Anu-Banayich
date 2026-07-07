/**
 * ויג'ט תרומה — כפתורי סכום + כפתור "תרום"
 * לחיצה על "תרום" → TODO Sprint 2 (DonationBottomSheet)
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDonationStore } from '@/store/donationStore';
import { DONATION_TIERS } from '@/constants/donations';
import { Button } from '@/components/common';
import { useLanguageStore } from '@/store/languageStore';

interface DonationWidgetProps {
  prayerId: string;
}

export function DonationWidget({ prayerId }: DonationWidgetProps) {
  const { t } = useTranslation();
  const { rtl } = useLanguageStore();
  const { selectedTier, currency, selectTier } = useDonationStore();
  const tiers = DONATION_TIERS[currency] ?? DONATION_TIERS.ILS;
  return (
    <View style={[styles.tiersContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      {tiers.map((tier) => (
        <TouchableOpacity
          key={tier.amount}
          onPress={() => selectTier(tier)}
          style={[
            styles.tierButton,
            selectedTier?.amount === tier.amount && styles.tierButtonSelected,
          ]}
        >
          <Text>{tier.display}</Text>
        </TouchableOpacity>
      ))}
      <Button
        label={t('donation.donate')}
        onPress={() => {
          // TODO Sprint 2
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tierButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 4,
  },
  tierButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  tiersContainer: {
    flexWrap: 'wrap',
  },
});
