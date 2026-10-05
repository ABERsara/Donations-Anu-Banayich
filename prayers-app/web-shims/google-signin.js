// Web stub for @react-native-google-signin/google-signin.
//
// This package is native-only: at import time it touches native modules
// that don't exist on web, which fails Metro's web bundle resolution
// (import { GoogleSignin } from '@react-native-google-signin/google-signin'
// in app/auth/login.tsx). All actual calls to GoogleSignin in that file are
// already guarded with Platform.OS !== 'web' (web uses the Firebase popup
// flow instead - see services/firebase.ts), so these stubs only need to
// satisfy Metro's module resolution at build time and are never invoked
// at runtime on web.

const WEB_UNSUPPORTED = {
  code: 'Failed',
  message: '@react-native-google-signin is not supported on web.',
};

function configure() {
  // no-op: never called on web (guarded by Platform.OS !== 'web')
}

async function hasPlayServices() {
  throw WEB_UNSUPPORTED;
}

async function signIn() {
  throw WEB_UNSUPPORTED;
}

const GoogleSignin = {
  configure,
  hasPlayServices,
  signIn,
};

module.exports = { GoogleSignin };
