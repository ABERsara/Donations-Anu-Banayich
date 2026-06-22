export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP' | 'ARS';
export type DonationStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface DonationTier {
  /** סכום בסנטים/אגורות (Stripe standard) — 7200 = ₪72 */
  amount: number;
  /** טקסט לתצוגה: "₪72" */
  display: string;
  /** שם סמלי: ע"ב */
  label: string;
}

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  stripeCode: string;
  tiers: DonationTier[];
}

export interface Donation {
  id: string;
  userId?: string;
  prayerId: string;
  quickButtonId?: string;
  amount: number;
  currency: Currency;
  stripePaymentIntentId?: string;
  status: DonationStatus;
  donorName: string;
  donorNote?: string;
  isAnonymous: boolean;
  receiptEmail?: string;
  createdAt: string;
}

export interface RecurringDonation {
  id: string;
  userId: string;
  prayerId: string;
  amount: number;
  currency: Currency;
  stripeSubscriptionId: string;
  dayOfMonth: number;
  isActive: boolean;
  nextChargeAt: string;
}

/** Payload לשרת לפתיחת תשלום */
export interface InitiateDonationPayload {
  prayerId: string;
  amount: number;
  currency: Currency;
  donorName: string;
  donorNote?: string;
  saveCard?: boolean;
  quickButtonSlug?: string;
}

/** תשובה מהשרת */
export interface InitiateDonationResponse {
  clientSecret: string;
  paymentIntentId: string;
}
