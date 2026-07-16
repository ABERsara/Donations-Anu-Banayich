/**
 * TODO: Bottom Sheet לתהליך התרומה
 *
 * שדות: שם תורם (Input), סכום (מ-store), כרטיס שמור (אם יש)
 * כפתורים: "אשר תרומה" → useDonation().initiateDonation()
 *           "שמור כרטיס" → checkbox
 *
 * משתמש ב: AppBottomSheet (components/common)
 *           Button (components/common)
 *           useDonation (hooks)
 *           selectHasSavedCard (store/authStore)
 */
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { useLanguageStore } from '@/store/languageStore';
import { useDonation } from '@/hooks/useDonation';
import { AppBottomSheet, Button, Input } from '@/components/common';
import { SuccessAnimation } from './SuccessAnimation';
import { PRAYER_NAME_MIN_AMOUNT } from '@/constants';
import type { Currency } from '@/types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
  GBP: '£',
  ARS: '$',
};

interface DonationBottomSheetProps {
  prayerId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function DonationBottomSheet({ prayerId, isVisible, onClose }: DonationBottomSheetProps) {
  const { t } = useTranslation();

  const { donorName, prayerName, setDonorName, setPrayerName, isSuccess, currency } =
    useDonationStore();
  const { rtl } = useLanguageStore();
  const amount = useDonationStore(selectFinalAmount);
  const { initiateDonation, isProcessing, error } = useDonation();

  const showPrayerNameField = amount >= PRAYER_NAME_MIN_AMOUNT;

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!donorName.trim()) {
      setValidationError(t('donation.name_required'));
      return;
    }
    setValidationError(null);
    initiateDonation(prayerId);
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      {isSuccess ? (
        <SuccessAnimation onClose={onClose} />
      ) : (
        <View>
          <Input
            label={t('donation.your_name')}
            value={donorName}
            onChangeText={setDonorName}
            error={validationError ?? undefined}
            rtl={rtl}
          />
          {showPrayerNameField && (
            <Input
              label={t('donation.prayer_name')}
              value={prayerName}
              onChangeText={setPrayerName}
              rtl={rtl}
            />
          )}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
          <Button
            label={t('donation.confirm_donation', {
              amount: `${CURRENCY_SYMBOLS[currency]}${(amount / 100).toFixed(0)}`,
            })}
            onPress={handleConfirm}
            isLoading={isProcessing}
          />
        </View>
      )}
    </AppBottomSheet>
  );
}
