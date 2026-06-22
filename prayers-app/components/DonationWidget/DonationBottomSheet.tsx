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
import React from 'react';
import { View, Text } from 'react-native';

interface DonationBottomSheetProps {
  prayerId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function DonationBottomSheet({ isVisible, onClose }: DonationBottomSheetProps) {
  // TODO: לממש
  return null;
}
