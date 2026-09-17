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
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from '@/services/firebase';
import { useRouter } from 'expo-router';
import { useAuthStore, selectIsNonAnonymous } from '@/store/authStore';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const isNonAnonymous = useAuthStore(selectIsNonAnonymous);

  useEffect(() => {
    if (isNonAnonymous) {
      router.replace('/(tabs)');
    }
  }, [isNonAnonymous, router]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();

      const { idToken } = await GoogleSignin.signIn();

      if (!idToken) {
        throw new Error('לא התקבל idToken מ-Google');
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);

      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        try {
          await linkWithCredential(currentUser, googleCredential);
        } catch (linkErr: any) {
          if (linkErr?.code === 'auth/credential-already-in-use') {
            await signInWithCredential(auth, googleCredential);
          } else {
            throw linkErr;
          }
        }
      } else {
        await signInWithCredential(auth, googleCredential);
      }
      //useAuth.ts תופס את השינוי דרך onAuthStateChanged ומעדכן את authStore לבד
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setGoogleError(t('auth.google_sign_in_failed'));
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <View>
      <Text>{t('auth.sign_in')}</Text>

      <TouchableOpacity onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
        {isGoogleLoading ? <ActivityIndicator /> : <Text>{t('auth.sign_in_google')}</Text>}
      </TouchableOpacity>
      {googleError && <Text>{googleError}</Text>}
    </View>
  );
}
