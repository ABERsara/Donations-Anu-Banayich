// Web shim for react-native/Libraries/Components/TextInput/TextInputState.
//
// @stripe/stripe-react-native deep-imports this internal React Native module,
// which does not resolve on web (it requires platform-specific Platform files
// that have no .web variant). Stripe only calls these methods on native, so on
// web we provide safe no-ops to let the web bundle build and run.
module.exports = {
  focusInput() {},
  registerInput() {},
  unregisterInput() {},
  currentlyFocusedInput() {
    return null;
  },
  currentlyFocusedField() {
    return null;
  },
  focusTextInput() {},
  blurTextInput() {},
};
