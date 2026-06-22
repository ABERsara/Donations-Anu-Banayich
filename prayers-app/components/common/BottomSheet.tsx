/**
 * TODO: Bottom Sheet ל-iOS + Android
 * מומלץ: @gorhom/bottom-sheet (כבר ב-package.json)
 * snapPoints: ['40%', '85%']
 */
import React from 'react';
import { View } from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function AppBottomSheet({ isVisible, onClose, children }: BottomSheetProps) {
  // TODO: להחליף ב-@gorhom/bottom-sheet
  if (!isVisible) return null;
  return <View>{children}</View>;
}
