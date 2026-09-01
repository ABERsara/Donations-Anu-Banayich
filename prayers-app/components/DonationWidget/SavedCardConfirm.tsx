/**
 * מסך אישור תרומה עם כרטיס שמור — "נגיעה אחת" (one-tap).
 * מוצג כשל-selectHasSavedCard(authStore) הוא true: מציג את פרטי הכרטיס
 * השמור ולחצן אישור בודד, ללא Stripe Payment Sheet וללא שדות קלט.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/common';

interface SavedCardConfirmProps {
  brand: string;
  last4: string;
  confirmLabel: string;
  onConfirm: () => void;
  isLoading: boolean;
  error: string | null;
}

export function SavedCardConfirm({
  brand,
  last4,
  confirmLabel,
  onConfirm,
  isLoading,
  error,
}: SavedCardConfirmProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('donation.saved_card', { brand, last4 })}</Text>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button label={confirmLabel} onPress={onConfirm} isLoading={isLoading} />
    </View>
  );
}
