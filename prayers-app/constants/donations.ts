import type { DonationTier, Currency } from '@/types/donation.types';

export const DONATION_TIERS: Record<Currency, DonationTier[]> = {
  ILS: [
    { amount: 1800, display: '₪18', label: 'חי' },
    { amount: 3600, display: '₪36', label: 'ל"ו' },
    { amount: 7200, display: '₪72', label: 'ע"ב' },
    { amount: 18000, display: '₪180', label: 'ק"פ' },
    { amount: 36000, display: '₪360', label: 'ש"ס' },
    { amount: -1, display: 'אחר', label: 'סכום אחר' },
  ],
  USD: [
    { amount: 500, display: '$5', label: '' },
    { amount: 1000, display: '$10', label: '' },
    { amount: 1800, display: '$18', label: 'Chai' },
    { amount: 5000, display: '$50', label: '' },
    { amount: 10000, display: '$100', label: '' },
    { amount: -1, display: 'Other', label: '' },
  ],
  EUR: [
    { amount: 500, display: '€5', label: '' },
    { amount: 1000, display: '€10', label: '' },
    { amount: 1800, display: '€18', label: 'Chai' },
    { amount: 5000, display: '€50', label: '' },
    { amount: -1, display: 'Autre', label: '' },
  ],
  GBP: [
    { amount: 400, display: '£4', label: '' },
    { amount: 900, display: '£9', label: '' },
    { amount: 1500, display: '£15', label: '' },
    { amount: 4000, display: '£40', label: '' },
    { amount: -1, display: 'Other', label: '' },
  ],
  ARS: [
    { amount: 50000, display: '$500', label: '' },
    { amount: 100000, display: '$1,000', label: '' },
    { amount: 200000, display: '$2,000', label: '' },
    { amount: -1, display: 'Otro', label: '' },
  ],
};

/** -1 מסמן "סכום חופשי" — יפתח שדה input */
export const CUSTOM_AMOUNT_VALUE = -1;
