// Web stub for @/services/firebase.
//
// During Expo's static export, the render bundle initialises firebase.ts at
// module-load time. getAuth() throws auth/invalid-api-key because Vercel has
// no EXPO_PUBLIC_FIREBASE_* env vars. Platform-extension resolution (.web.ts)
// does not apply to the SSR render bundle, so we intercept the path alias
// directly via metro.config.js webStubs.
//
// All exports are safe no-ops; the real Firebase runs only on native.

const auth = {};

const signInAnon = async () => {};

const getIdToken = async (_forceRefresh) => '';

const signOutUser = async () => {};

const onAuthStateChanged = (_auth, _callback) => () => {};

const GoogleAuthProvider = { credential: (_idToken) => ({}) };

const signInWithCredential = async (_auth, _credential) => ({});

const linkWithCredential = async (_user, _credential) => ({});

module.exports = {
  auth,
  signInAnon,
  getIdToken,
  signOutUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
};
