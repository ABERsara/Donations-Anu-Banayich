/** TODO: Spinner מרכזי עם צבעי הארגון + לוגו */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { THEME } from '@/constants/theme';

export function LoadingSpinner() {
  // TODO: להוסיף לוגו + אנימציה
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={THEME.gold} />
    </View>
  );
}
