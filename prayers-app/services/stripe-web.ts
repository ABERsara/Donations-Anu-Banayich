import { loadStripe } from '@stripe/stripe-js';

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * טוען את Stripe.js פעם אחת ומשתף את המופע בכל האפליקציה (Web בלבד).
 * מקביל ל-initializeStripe() ב-services/stripe.ts (Native).
 *
 * null כשאין env var (Vercel static export) — Elements מקבל null ולא מאתחל.
 */
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
