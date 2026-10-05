const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @stripe/stripe-react-native (and other native-only libs) deep-import internal
// React Native modules that don't exist on web. Redirect those to web-safe
// shims so the web bundle can build. Native platforms are unaffected.
const webStubs = {
  // Stripe React Native is native-only; stub the whole package on web.
  '@stripe/stripe-react-native': path.resolve(__dirname, 'web-shims/stripe-react-native.js'),
  // Google Sign-In is native-only; no web OAuth flow in this app.
  '@react-native-google-signin/google-signin': path.resolve(
    __dirname,
    'web-shims/google-signin.js'
  ),
  // Firebase auth initialises at module-load time and throws auth/invalid-api-key
  // when env vars are absent during Vercel static export. The SSR render bundle
  // does not apply .web.ts extensions, so we intercept the path alias directly.
  '@/services/firebase': path.resolve(__dirname, 'web-shims/firebase.js'),
  // Kept as a safety net for any other lib that deep-imports this on web.
  'react-native/Libraries/Components/TextInput/TextInputState': path.resolve(
    __dirname,
    'web-shims/TextInputState.js'
  ),
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webStubs[moduleName]) {
    return { type: 'sourceFile', filePath: webStubs[moduleName] };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
