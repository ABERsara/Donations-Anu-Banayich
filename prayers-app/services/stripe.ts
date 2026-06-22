import { initStripe, presentPaymentSheet, createPaymentMethod } from '@stripe/stripe-react-native';

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
export async function openPaymentSheet(clientSecret: string): Promise<boolean> {
  // TODO: להגדיר setupIntent / customFlow לפי הצורך
  const { error } = await presentPaymentSheet();
  if (error) {
    console.warn('Stripe error:', error.message);
    return false;
  }
  return true;
}

// TODO: Apple Pay / Google Pay — להוסיף כשה-merchant account מאושר
