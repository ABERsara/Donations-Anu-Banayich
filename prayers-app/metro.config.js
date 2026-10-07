const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Libraries that are native-only and must always be stubbed on any web
// build (dev server and production export alike) - they have no web
// implementation at all, regardless of SSR vs. client bundle.
const allWebStubs = {
  '@stripe/stripe-react-native': path.resolve(__dirname, 'web-shims/stripe-react-native.js'),
  '@react-native-google-signin/google-signin': path.resolve(
    __dirname,
    'web-shims/google-signin.js'
  ),
  'react-native/Libraries/Components/TextInput/TextInputState': path.resolve(
    __dirname,
    'web-shims/TextInputState.js'
  ),
};

// @/services/firebase DOES have a real web implementation (the Firebase JS
// SDK works fine in a real browser). It only needs stubbing during the SSR
// render pass, where getAuth() throws auth/invalid-api-key because env vars
// aren't available at that stage. Stubbing it unconditionally (like the libs
// above) would replace the real SDK in the actual browser bundle too -
// breaking Google Sign-In there. So this map is checked separately, gated
// on context.customTransformOptions.environment === 'node' (SSR), not on
// platform === 'web' alone.
const ssrOnlyStubs = {
  '@/services/firebase': path.resolve(__dirname, 'web-shims/firebase.ts'),
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isSSR = context.customTransformOptions?.environment === 'node';

  if (moduleName === '@/services/firebase') {
    console.log('[DEBUG firebase resolve]', {
      environment: context.customTransformOptions?.environment,
      isSSR,
      platform,
    });
  }

  if (platform === 'web') {
    if (allWebStubs[moduleName]) {
      return { type: 'sourceFile', filePath: allWebStubs[moduleName] };
    }
    if (isSSR && ssrOnlyStubs[moduleName]) {
      return { type: 'sourceFile', filePath: ssrOnlyStubs[moduleName] };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

const defaultEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const baseMiddleware = defaultEnhanceMiddleware
    ? defaultEnhanceMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    return baseMiddleware(req, res, next);
  };
};

module.exports = config;
