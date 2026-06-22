import { create } from 'zustand';
import type { AppUser } from '@/types/user.types';

interface AuthStore {
  user: AppUser | null;
  firebaseToken: string | null;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  firebaseToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ firebaseToken: token }),
  setLoading: (v) => set({ isLoading: v }),
  reset: () => set({ user: null, firebaseToken: null }),
}));

// selectors
export const selectIsLoggedIn = (s: AuthStore) => !!s.user && !s.user.isAnonymous;
export const selectHasSavedCard = (s: AuthStore) => s.user?.hasSavedCard ?? false;
