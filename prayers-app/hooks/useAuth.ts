/**
 *  * useAuth — ניהול מצב ההתחברות של האפליקציה
 * - האזנה ל-onAuthStateChanged מ-Firebase
 * - כניסה אנונימית אוטומטית בפתיחה
 * - שמירת token ב-authStore
 * - קריאה ל-GET /api/users/me לקבלת הפרופיל
 */
import { useEffect, useState } from 'react';
import {
  auth,
  getIdToken,
  onAuthStateChanged,
  signInAnon,
  signOutUser,
  type User,
} from '@/services/firebase';
import type { AppUser } from '@/types/user.types';
import { getMe } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

function buildAppUser(
  serverUser: Omit<AppUser, 'isAnonymous' | 'createdAt'>,
  firebaseUser: User
): AppUser {
  return {
    ...serverUser, // כל השדות שכבר תואמים בדיוק ל-AppUser (id, email, hasSavedCard וכו')
    isAnonymous: firebaseUser.isAnonymous, // מגיע מ-Firebase, לא מהשרת
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toISOString()
      : new Date().toISOString(), // גיבוי, למקרה הנדיר שאין creationTime
  };
}

export function useAuth(): { user: AppUser | null; isLoading: boolean; error: string | null } {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      const store = useAuthStore.getState();
      if (firebaseUser) {
        // מסלול מהיר: לעדכן isNonAnonymous מיד, בלי לחכות ל-getMe() מהשרת,
        // כדי שמסכים כמו login.tsx יוכלו לנווט מוקדם ככל האפשר.
        store.setNonAnonymous(!firebaseUser.isAnonymous);
        try {
          const token: string = await getIdToken();
          const serverUser = (await getMe(token)) as Omit<AppUser, 'isAnonymous' | 'createdAt'>;
          const appUser = buildAppUser(serverUser, firebaseUser);
          setUser(appUser);
          setIsLoading(false);
          store.setToken(token);
          store.setUser(appUser);
          store.setLoading(false);
        } catch (err) {
          setError('auth.load_user_failed');
          setIsLoading(false);
          store.setLoading(false);
          store.setNonAnonymous(false);
        }
      } else {
        store.setNonAnonymous(false);
        try {
          await signInAnon();
        } catch (err) {
          setError('auth.anonymous_sign_in_failed');
          setIsLoading(false);
          store.setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);
  return { user: user, isLoading: isLoading, error: error };
}

export function useSignOut(): () => Promise<void> {
  const router = useRouter();

  return async () => {
    try {
      await signOutUser();
      useAuthStore.getState().reset();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };
}
