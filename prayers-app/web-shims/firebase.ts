/**
 * Web stub for @/services/firebase.
 *
 * During Expo's static export, the render bundle initialises firebase.ts at
 * module-load time. getAuth() throws auth/invalid-api-key because Vercel has
 * no EXPO_PUBLIC_FIREBASE_* env vars. Platform-extension resolution (.web.ts)
 * does not apply to the SSR render bundle, so we intercept the path alias
 * directly via metro.config.js webStubs.
 *
 * All exports are safe no-ops; the real Firebase runs only on native.
 *
 * `typeof FirebaseService` ties this stub's shape to the real module at
 * compile time: npm run type-check fails if the two ever drift (a new
 * export added to services/firebase.ts without updating this stub here,
 * or vice versa). No manual sync tracking required.
 */
import type * as FirebaseService from '../services/firebase';

export const auth: typeof FirebaseService.auth = {} as typeof FirebaseService.auth;

export const signInAnon: typeof FirebaseService.signInAnon = (async () => ({})) as any;

export const getIdToken: typeof FirebaseService.getIdToken = (async () => '') as any;

export const signOutUser: typeof FirebaseService.signOutUser = async () => {};

export const onAuthStateChanged: typeof FirebaseService.onAuthStateChanged = ((
    _auth: any,
    _callback: any
  ) =>
  () => {}) as any;

export const onIdTokenChanged: typeof FirebaseService.onIdTokenChanged = ((
    _auth: any,
    _callback: any
  ) =>
  () => {}) as any;

export const GoogleAuthProvider: typeof FirebaseService.GoogleAuthProvider = {
  credential: (_idToken: string) => ({}) as any,
  credentialFromError: (_error: any) => null,
} as any;

export const signInWithCredential: typeof FirebaseService.signInWithCredential =
  (async () => ({})) as any;

export const linkWithCredential: typeof FirebaseService.linkWithCredential =
  (async () => ({})) as any;

export const signInWithPopup: typeof FirebaseService.signInWithPopup = (async () => ({})) as any;

export const linkWithPopup: typeof FirebaseService.linkWithPopup = (async () => ({})) as any;

export type { User } from '../services/firebase';
