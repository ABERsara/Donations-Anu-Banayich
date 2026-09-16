// Web stub for @react-native-google-signin/google-signin.
//
// This package is native-only: at import time it accesses native modules
// that don't exist on web, crashing the static export / web bundle.
// All methods return a "not supported on web" error so the app degrades
// gracefully; sign-in on web is not a supported flow.

const WEB_UNSUPPORTED_CODE = 'SIGN_IN_CANCELLED';
const WEB_UNSUPPORTED_MSG = 'Google Sign-In is not supported on web.';

const GoogleSignin = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => {
    throw { code: WEB_UNSUPPORTED_CODE, message: WEB_UNSUPPORTED_MSG };
  },
  signOut: async () => {},
  isSignedIn: () => false,
  getCurrentUser: () => null,
  getTokens: async () => {
    throw { code: WEB_UNSUPPORTED_CODE, message: WEB_UNSUPPORTED_MSG };
  },
  revokeAccess: async () => {},
};

const statusCodes = {
  SIGN_IN_CANCELLED: WEB_UNSUPPORTED_CODE,
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
};

module.exports = { GoogleSignin, statusCodes };
