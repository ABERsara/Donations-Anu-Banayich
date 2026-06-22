// Web stub for @stripe/stripe-react-native.
//
// This package is native-only: at import time it touches native modules
// (e.g. NativeModules.StripeSdk.getConstants()) that don't exist on web, which
// crashes the web bundle / static rendering. The app only calls a few payment
// helpers (via services/stripe.ts), so on web we provide safe no-ops.
//
// Real web payments should go through @stripe/stripe-js instead.

const WEB_UNSUPPORTED = {
  code: 'Failed',
  message: 'Stripe payments are not supported on web.',
};

async function initStripe() {
  return {};
}

async function initPaymentSheet() {
  return { error: WEB_UNSUPPORTED };
}

async function presentPaymentSheet() {
  return { error: WEB_UNSUPPORTED };
}

async function confirmPaymentSheetPayment() {
  return { error: WEB_UNSUPPORTED };
}

async function createPaymentMethod() {
  return { error: WEB_UNSUPPORTED };
}

async function confirmPayment() {
  return { error: WEB_UNSUPPORTED };
}

async function createToken() {
  return { error: WEB_UNSUPPORTED };
}

function useStripe() {
  return {
    initPaymentSheet,
    presentPaymentSheet,
    confirmPaymentSheetPayment,
    createPaymentMethod,
    confirmPayment,
    createToken,
  };
}

// StripeProvider / UI components render nothing on web.
function StripeProvider({ children }) {
  return children ?? null;
}

const noopComponent = () => null;

module.exports = {
  initStripe,
  initPaymentSheet,
  presentPaymentSheet,
  confirmPaymentSheetPayment,
  createPaymentMethod,
  confirmPayment,
  createToken,
  useStripe,
  StripeProvider,
  CardField: noopComponent,
  CardForm: noopComponent,
  ApplePayButton: noopComponent,
  GooglePayButton: noopComponent,
  AddToWalletButton: noopComponent,
  useConfirmPayment: () => ({ confirmPayment, loading: false }),
  useConfirmSetupIntent: () => ({
    confirmSetupIntent: async () => ({ error: WEB_UNSUPPORTED }),
    loading: false,
  }),
};
