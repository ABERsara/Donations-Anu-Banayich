const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const webStubs = {
  '@stripe/stripe-react-native': path.resolve(__dirname, 'web-shims/stripe-react-native.js'),
  '@react-native-google-signin/google-signin': path.resolve(
    __dirname,
    'web-shims/google-signin.js'
  ),
  '@/services/firebase': path.resolve(__dirname, 'web-shims/firebase.js'),
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