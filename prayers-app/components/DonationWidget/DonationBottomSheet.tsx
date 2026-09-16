import React, { useState } from 'react';
import { View, Text, Platform, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/constants/theme';

import { useDonationStore, selectFinalAmount } from '@/store/donationStore';
import { useAuthStore, selectHasSavedCard } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useDonation } from '@/hooks/useDonation';
import { AppBottomSheet, Button, Input } from '@/components/common';
import { SuccessAnimation } from './SuccessAnimation';
import { SavedCardConfirm } from './SavedCardConfirm';
import WebPaymentForm from './WebPaymentForm';
import { PRAYER_NAME_MIN_AMOUNT } from '@/constants';
import { formatAmount } from '@/utils/formatAmount';

interface DonationBottomSheetProps {
  prayerId: string;
  isVisible: boolean;
  onClose: () => void;
  quickButtonSlug?: string;
}

export function DonationBottomSheet({
  prayerId,
  isVisible,
  onClose,
  quickButtonSlug,
}: DonationBottomSheetProps) {
  const { t } = useTranslation();

  const {
    donorName,
    prayerName,
    saveCard,
    setSaveCard,
    setDonorName,
    setPrayerName,
    isSuccess,
    currency,
  } = useDonationStore();
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
    amount: formatAmount(amount, currency),
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
      const secret = await initiateWebPayment(prayerId, quickButtonSlug);
      if (secret) {
        setClientSecret(secret);
      }
    } else {
      initiateDonation(prayerId, quickButtonSlug);
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
          onConfirm={() => quickDonate(prayerId, quickButtonSlug)}
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
          <Pressable onPress={() => setSaveCard(!saveCard)} style={styles.checkboxRow}>
            <View style={[styles.checkboxBox, saveCard && styles.checkboxBoxChecked]}>
              {saveCard && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>{t('donation.save_card')}</Text>
          </Pressable>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Button label={confirmLabel} onPress={handleConfirm} isLoading={isProcessing} />
        </View>
      )}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.ink.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary.DEFAULT,
    borderColor: COLORS.primary.DEFAULT,
  },
  checkboxMark: {
    color: COLORS.surface.card,
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: COLORS.ink.DEFAULT,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
  },
});
