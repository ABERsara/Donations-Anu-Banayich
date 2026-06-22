/**
 * TODO: מסך בית
 * מציג: QuickButtons + רשימת תפילות פופולריות + AppDownloadBanner
 * קריאה ל: GET /api/prayers (usePrayer)
 */
import React from 'react';
import { View, Text } from 'react-native';
import { QuickButtons } from '@/components/QuickButtons';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AppDownloadBanner />
      <QuickButtons />
      {/* TODO: רשימת קטגוריות + תפילות */}
    </View>
  );
}
