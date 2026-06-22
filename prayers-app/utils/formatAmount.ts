import type { Currency } from '@/types/donation.types';

const SYMBOLS: Record<Currency, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
  GBP: '£',
  ARS: '$',
};

/** המרה מסנטים/אגורות לתצוגה: 7200 → "₪72" */
export function formatAmount(amountInCents: number, currency: Currency): string {
  const symbol = SYMBOLS[currency];
  const value = amountInCents / 100;
  // TODO: טיפול ב-ARS (לא מחולק ב-100 ב-Stripe)
  return `${symbol}${value.toLocaleString()}`;
}
