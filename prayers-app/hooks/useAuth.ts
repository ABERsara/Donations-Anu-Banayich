/**
 * TODO: לממש
 * - האזנה ל-onAuthStateChanged מ-Firebase
 * - כניסה אנונימית אוטומטית בפתיחה
 * - שמירת token ב-authStore
 * - קריאה ל-GET /api/users/me לקבלת הפרופיל
 */
import { useEffect, useState } from 'react';
import { auth, getIdToken, onAuthStateChanged, signInAnon, type User } from '@/services/firebase';
import type { AppUser } from '@/types/user.types';
import { getMe } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

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
          setError('לא ניתן לטעון את פרטי המשתמש. אנא נסה שוב מאוחר יותר.');
          console.error('Error fetching user data:', err);
          setIsLoading(false);
          store.setLoading(false);
        }
      } else {
        try {
          await signInAnon();
        } catch (err) {
          setError('לא ניתן להיכנס באופן אנונימי. אנא נסה שוב מאוחר יותר.');
          console.error('Error signing in anonymously:', err);
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
  // TODO: לממש — Firebase signOut + reset store
  return async () => {};
}
