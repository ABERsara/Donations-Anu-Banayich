import type { Currency } from '@/types/donation.types';

const SYMBOLS: Record<Currency, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€',
  GBP: '£',
  ARS: '$',
};

const ZERO_DECIMAL_CURRENCIES: Currency[] = ['ARS'];

/** המרה מסנטים/אגורות לתצוגה: 7200 → "₪72" */
export function formatAmount(amountInCents: number, currency: Currency): string {
  const symbol = SYMBOLS[currency];
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.includes(currency);
  const value = isZeroDecimal ? amountInCents : amountInCents / 100;
  return `${symbol}${value.toLocaleString()}`;
}
