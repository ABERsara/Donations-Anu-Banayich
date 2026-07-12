import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDonationStore } from '@/store/donationStore';
import { DONATION_TIERS, CUSTOM_AMOUNT_VALUE } from '@/constants/donations';
import { Button } from '@/components/common';
import { useLanguageStore } from '@/store/languageStore';
import { DonationBottomSheet } from './DonationBottomSheet';
interface DonationWidgetProps {
  prayerId: string;
}

export function DonationWidget({ prayerId }: DonationWidgetProps) {
  const { t } = useTranslation();
  const { rtl, currency } = useLanguageStore();
  const { selectedTier, selectTier, setCustomAmount } = useDonationStore();
  const tiers = DONATION_TIERS[currency] ?? DONATION_TIERS.ILS;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  return (
    <View>
      <View style={[styles.tiersContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {tiers.map((tier) => (
          <TouchableOpacity
            key={tier.amount}
            onPress={() => {
              selectTier(tier);
              setIsCustom(tier.amount === CUSTOM_AMOUNT_VALUE);
            }}
            style={[
              styles.tierButton,
              selectedTier?.amount === tier.amount && styles.tierButtonSelected,
            ]}
          >
            <Text>{tier.display}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {isCustom && (
        <TextInput
          placeholder={t('donation.custom_amount')}
          keyboardType="numeric"
          onChangeText={(text) => {
            const amount = Math.round(Number(text) * 100);
            setCustomAmount(amount);
          }}
        />
      )}
      <Button label={t('donation.donate')} onPress={() => setSheetOpen(true)} />
      <DonationBottomSheet
        prayerId={prayerId}
        isVisible={sheetOpen}
        onClose={() => setSheetOpen(false)}
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
