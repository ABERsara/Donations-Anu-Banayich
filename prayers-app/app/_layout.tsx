/**
 * ROOT LAYOUT — נקודת הכניסה של כל האפליקציה
 * ─────────────────────────────────────────────
 * מאתחל: i18n, Stripe, Firebase listener, RTL
 */
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n, { initI18n } from '@/i18n';
import { initializeStripe } from '@/services/stripe';
import { LoadingSpinner } from '@/components/common';

// TODO: להוסיף useAuth listener כאן לאחר מימוש useAuth.ts

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      initI18n(),
      initializeStripe(),
      // TODO: signInAnon() לכניסה אנונימית אוטומטית
    ]).then(() => setReady(true));
  }, []);

  if (!ready) return <LoadingSpinner />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <Stack screenOptions={{ headerShown: false }} />
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
