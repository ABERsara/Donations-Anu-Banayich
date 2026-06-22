/**
 * TODO: באנר "הורד את האפליקציה" — מוצג רק ב-Web
 *
 * לוגיקה:
 * - Platform.OS !== 'web' → return null
 * - בדיקת AsyncStorage: STORAGE_KEYS.DISMISSED_BANNER → return null
 * - זיהוי UA: iPhone → App Store | Android → Google Play | Desktop → QR
 * - כפתור "לא עכשיו" → שמור DISMISSED_BANNER ב-AsyncStorage
 *
 * URLs: APP_CONFIG.APPLE_STORE_URL / GOOGLE_PLAY_URL
 */
import React from 'react';
import { View, Text } from 'react-native';

export function AppDownloadBanner() {
  // TODO: לממש
  return null;
}
