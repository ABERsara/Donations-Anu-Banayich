const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @stripe/stripe-react-native (and other native-only libs) deep-import internal
// React Native modules that don't exist on web. Redirect those to web-safe
// shims so the web bundle can build. Native platforms are unaffected.
const webStubs = {
  // Stripe React Native is native-only; stub the whole package on web.
  '@stripe/stripe-react-native': path.resolve(__dirname, 'web-shims/stripe-react-native.js'),
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
