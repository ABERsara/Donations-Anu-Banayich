import type { CurrencyConfig } from '@/types/donation.types';
import { DONATION_TIERS } from '@/constants/donations';

const EU = ['FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'CH', 'GR', 'SE', 'DK', 'NO'];

const COUNTRY_MAP: Record<string, CurrencyConfig> = {
  IL: { code: 'ILS', symbol: '₪', stripeCode: 'ils', tiers: DONATION_TIERS.ILS },
  US: { code: 'USD', symbol: '$', stripeCode: 'usd', tiers: DONATION_TIERS.USD },
  GB: { code: 'GBP', symbol: '£', stripeCode: 'gbp', tiers: DONATION_TIERS.GBP },
  AR: { code: 'ARS', symbol: '$', stripeCode: 'ars', tiers: DONATION_TIERS.ARS },
};

const DEFAULT: CurrencyConfig = {
  code: 'USD',
  symbol: '$',
  stripeCode: 'usd',
  tiers: DONATION_TIERS.USD,
};

/** מזהה מטבע לפי IP — fallback ל-USD */
export async function detectCurrency(): Promise<CurrencyConfig> {
  try {
    const res = await fetch('https://ipapi.co/json/'); // 1,000 req/day בחינם
    const data = await res.json();
    const cc: string = data.country_code ?? '';
    if (EU.includes(cc)) {
      return { code: 'EUR', symbol: '€', stripeCode: 'eur', tiers: DONATION_TIERS.EUR };
    }
    return COUNTRY_MAP[cc] ?? DEFAULT;
  } catch {
    return DEFAULT;
  }
}
