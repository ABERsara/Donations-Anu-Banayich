import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { useAuthStore, selectHasSavedCard } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useDonation } from '@/hooks/useDonation';
import { AppBottomSheet, Button, Input } from '@/components/common';
import { SuccessAnimation } from './SuccessAnimation';
import { SavedCardConfirm } from './SavedCardConfirm';
import WebPaymentForm from './WebPaymentForm';
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
  const hasSavedCard = useAuthStore(selectHasSavedCard);
  const user = useAuthStore((s) => s.user);
  const {
    initiateDonation,
    initiateWebPayment,
    handleWebPaymentResult,
    quickDonate,
    isProcessing,
    error,
  } = useDonation();

  const showPrayerNameField = amount >= PRAYER_NAME_MIN_AMOUNT;
  const confirmLabel = t('donation.confirm_donation', {
    amount: `${CURRENCY_SYMBOLS[currency]}${(amount / 100).toFixed(0)}`,
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!donorName.trim()) {
      setValidationError(t('donation.name_required'));
      return;
    }
    setValidationError(null);

    if (Platform.OS === 'web') {
      const secret = await initiateWebPayment(prayerId);
      if (secret) {
        setClientSecret(secret);
      }
    } else {
      initiateDonation(prayerId);
    }
  };

  const handleWebResult = async (
    result: 'success' | 'canceled' | 'failed',
    paymentIntentId?: string,
    saveCard?: boolean
  ) => {
    await handleWebPaymentResult(result, paymentIntentId, saveCard);
    if (result !== 'failed') {
      setClientSecret(null);
    }
  };

  return (
    <AppBottomSheet isVisible={isVisible} onClose={onClose}>
      {isSuccess ? (
        <SuccessAnimation onClose={onClose} />
      ) : hasSavedCard ? (
        <SavedCardConfirm
          brand={user?.savedCardBrand?.toUpperCase() ?? ''}
          last4={user?.savedCardLast4 ?? ''}
          confirmLabel={confirmLabel}
          onConfirm={() => quickDonate(prayerId)}
          isLoading={isProcessing}
          error={error}
        />
      ) : clientSecret ? (
        <WebPaymentForm clientSecret={clientSecret} onResult={handleWebResult} />
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
          <Button label={confirmLabel} onPress={handleConfirm} isLoading={isProcessing} />
        </View>
      )}
    </AppBottomSheet>
  );
}
