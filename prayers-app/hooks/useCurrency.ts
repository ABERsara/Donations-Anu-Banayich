/**
 * TODO: לממש
 * - קריאה ל-detectCurrency() מ-utils
 * - שמירה ב-languageStore
 * - אפשרות override ידנית למשתמש
 */
import type { CurrencyConfig } from '@/types/donation.types';
import { DONATION_TIERS } from '@/constants/donations';

export function useCurrency(): CurrencyConfig {
  // TODO: להחליף בזיהוי אוטומטי מ-IP
  return { code: 'ILS', symbol: '₪', stripeCode: 'ils', tiers: DONATION_TIERS.ILS };
}
