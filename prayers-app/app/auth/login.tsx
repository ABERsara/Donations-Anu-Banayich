/**
 * TODO: מסך התחברות
 *
 * כפתורים (לפי פלטפורמה):
 *  - Google Sign-In  (Android + Web)
 *  - Apple Sign-In   (iOS בלבד — חובה ל-App Store!)
 *  - Phone/SMS OTP
 *
 * לאחר התחברות:
 *  - linkWithCredential אם המשתמש כבר Anonymous
 *  - עדכון authStore
 *  - router.back()
 *
 * ראה services/firebase.ts
 */
import React from 'react';
import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View>
      <Text>התחברות — TODO</Text>
    </View>
  );
}
