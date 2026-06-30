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
import { StripeProvider } from '@stripe/stripe-react-native';

import i18n, { initI18n } from '@/i18n';
import { initializeStripe } from '@/services/stripe';
import { LoadingSpinner } from '@/components/common';
import { signInAnon } from '@/services/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([initI18n(), initializeStripe(), signInAnon()])
      .then(() => setReady(true))
      .catch((error) => {
        console.error('App initialization failed:', error);
        setReady(true);
      });
  }, []);

  useAuth();
  if (!ready) return <LoadingSpinner />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
          <I18nextProvider i18n={i18n}>
            <Stack screenOptions={{ headerShown: false }} />
          </I18nextProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
