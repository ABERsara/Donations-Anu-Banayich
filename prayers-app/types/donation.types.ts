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
  prayer_id: string;
  amount: number;
  currency: Currency;
  donor_name: string;
  prayer_name?: string;
  donor_note?: string;
  save_card?: boolean;
  quick_button_slug?: string;
}

/** תשובה מהשרת */
export interface InitiateDonationResponse {
  client_secret: string;
  payment_intent_id: string;
}
/** Payload לאישור תשלום */
export interface ConfirmDonationPayload {
  payment_intent_id: string;
}

/** תשובה מהשרת לאישור */
export interface ConfirmDonationResponse {
  status: DonationStatus;
}
