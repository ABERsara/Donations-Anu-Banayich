/**
 * TODO: ויג'ט תרומה — כפתורי סכום + כפתור "תרום"
 *
 * Props: prayerId, currency
 * מציג: DONATION_TIERS[currency] כרשת כפתורים
 * לחיצה על סכום → useDonationStore.selectTier
 * לחיצה על "תרום" → פותח DonationBottomSheet
 *
 * ראה DONATION_TIERS ב-constants/donations.ts
 * ראה Button ב-components/common/Button.tsx לדוגמא לסגנון
 */
import React from 'react';
import { View, Text } from 'react-native';

interface DonationWidgetProps {
  prayerId: string;
}

export function DonationWidget({ prayerId }: DonationWidgetProps) {
  // TODO: לממש
  return (
    <View>
      <Text>DonationWidget — TODO</Text>
    </View>
  );
}
