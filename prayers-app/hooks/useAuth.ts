/**
 * TODO: לממש
 * - האזנה ל-onAuthStateChanged מ-Firebase
 * - כניסה אנונימית אוטומטית בפתיחה
 * - שמירת token ב-authStore
 * - קריאה ל-GET /api/users/me לקבלת הפרופיל
 */
import type { AppUser } from '@/types/user.types';

export function useAuth(): { user: AppUser | null; isLoading: boolean } {
  // TODO: לממש
  return { user: null, isLoading: true };
}

export function useSignOut(): () => Promise<void> {
  // TODO: לממש — Firebase signOut + reset store
  return async () => {};
}
