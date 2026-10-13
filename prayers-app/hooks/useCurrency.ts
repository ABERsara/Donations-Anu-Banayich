/**
 * TODO: לממש
 * - קריאה ל-detectCurrency() מ-utils
 * - שמירה ב-languageStore
 * - אפשרות override ידנית למשתמש
 */
import type { CurrencyConfig } from '@/types/donation.types';
import { DONATION_TIERS } from '@/constants/donations';
import { useEffect, useState } from 'react';
import { detectCurrency } from '@/utils/detectCurrency';

const DEFAULT_CONFIG: CurrencyConfig = {
  code: 'ILS',
  symbol: '₪',
  stripeCode: 'ils',
  tiers: DONATION_TIERS.ILS,
};

export function useCurrency(): CurrencyConfig {
  //   זיהוי אוטומטי מ-IP
  const [currency, setCurrency] = useState<CurrencyConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    let isMounted = true;

    detectCurrency().then((detected) => {
      if (isMounted) {
        setCurrency(detected);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return currency;
}
