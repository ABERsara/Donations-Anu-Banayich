import {
  initStripe,
  initPaymentSheet,
  presentPaymentSheet,
  createPaymentMethod,
} from '@stripe/stripe-react-native';

/** לקרוא פעם אחת ב-app/_layout.tsx */
export async function initializeStripe() {
  await initStripe({
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    merchantIdentifier: 'merchant.com.yourorg.prayersapp', // Apple Pay
  });
}

/**
 * פותח את Stripe Payment Sheet
 * @param clientSecret — מתקבל מ-backend /api/donations/initiate
 */
export type PaymentSheetResult = 'success' | 'canceled' | 'failed';

export async function openPaymentSheet(clientSecret: string): Promise<PaymentSheetResult> {
  // TODO: להגדיר setupIntent / customFlow לפי הצורך
  const { error: initError } = await initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: 'Prayers App',
  });
  if (initError) {
    console.warn('Stripe init error:', initError.message);
    return 'failed';
  }
  const { error: presentError } = await presentPaymentSheet();
  if (presentError) {
    if (presentError.code === 'Canceled') {
      return 'canceled';
    }
    console.warn('Stripe present error:', presentError.message);
    return 'failed';
  }
  return 'success';
}

// TODO: Apple Pay / Google Pay — להוסיף כשה-merchant account מאושר
