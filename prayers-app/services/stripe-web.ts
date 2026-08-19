import { loadStripe } from '@stripe/stripe-js';

/**
 * טוען את Stripe.js פעם אחת ומשתף את המופע בכל האפליקציה (Web בלבד).
 * מקביל ל-initializeStripe() ב-services/stripe.ts (Native).
 */
export const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
