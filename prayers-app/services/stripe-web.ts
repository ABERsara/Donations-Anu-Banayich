import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment variables.');
}

/**
 * טוען את Stripe.js פעם אחת ומשתף את המופע בכל האפליקציה (Web בלבד).
 * מקביל ל-initializeStripe() ב-services/stripe.ts (Native).
 */
export const stripePromise = loadStripe(publishableKey);
