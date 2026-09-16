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
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
  signInWithPopup,
  linkWithPopup,
} from '@/services/firebase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const currentUser = auth.currentUser;
        if (currentUser?.isAnonymous) {
          try {
            await linkWithPopup(currentUser, provider);
          } catch (linkErr: any) {
            if (linkErr?.code === 'auth/credential-already-in-use') {
              const credential = GoogleAuthProvider.credentialFromError(linkErr);
              if (credential) {
                await signInWithCredential(auth, credential);
              } else {
                await signInWithPopup(auth, provider);
              }
            } else {
              throw linkErr;
            }
          }
        } else {
          await signInWithPopup(auth, provider);
        }
      } else {
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
      }
    } catch (err: any) {
      setGoogleError(t('auth.error'));
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <View>
      <Text>{t('auth.sign_in')}</Text>
      <TouchableOpacity onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
        {isGoogleLoading ? <ActivityIndicator /> : <Text> {t('auth.sign_in_google')} </Text>}
      </TouchableOpacity>
      {googleError && <Text>{googleError}</Text>}
    </View>
  );
}
