// Web stub for Firebase auth.
//
// During Vercel's static export (and any web build) Firebase initializes at
// module-load time and throws auth/invalid-api-key when env vars are absent.
// This stub lets the web bundle build without Firebase credentials.
// The real firebase.ts is used on Android/iOS where the app actually runs.

import type { User } from 'firebase/auth';

export const auth = {} as any;

export const signInAnon = async () => {};

export const getIdToken = async (_forceRefresh = false): Promise<string> => '';

export const signOutUser = async () => {};

export const onAuthStateChanged =
  (_auth: any, _callback: (user: User | null) => void): (() => void) =>
  () => {};

export const GoogleAuthProvider = {
  credential: (_idToken: string | null) => ({}),
};

export const signInWithCredential = async (_auth: any, _credential: any): Promise<any> => ({});

export const linkWithCredential = async (_user: any, _credential: any): Promise<any> => ({});

export type { User };
