import { create } from 'zustand';
import type { Currency, DonationTier } from '@/types/donation.types';

interface DonationStore {
  // שלב 1 — בחירת סכום
  selectedTier: DonationTier | null;
  customAmount: number | null;
  currency: Currency;

  // שלב 2 — פרטי תורם
  donorName: string;
  prayerName: string;
  saveCard: boolean;

  // סטטוס
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;

  // actions
  selectTier: (tier: DonationTier) => void;
  setCustomAmount: (amount: number) => void;
  setCurrency: (currency: Currency) => void;
  setDonorName: (name: string) => void;
  setPrayerName: (name: string) => void;
  setSaveCard: (v: boolean) => void;
  setProcessing: (v: boolean) => void;
  setSuccess: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

const INITIAL: Partial<DonationStore> = {
  selectedTier: null,
  customAmount: null,
  currency: 'ILS',
  donorName: '',
  prayerName: '',
  saveCard: false,
  isProcessing: false,
  isSuccess: false,
  error: null,
};

export const useDonationStore = create<DonationStore>((set) => ({
  ...(INITIAL as DonationStore),
  selectTier: (tier) => set({ selectedTier: tier, customAmount: null }),
  setCustomAmount: (amount) => set({ customAmount: amount, selectedTier: null }),
  setCurrency: (currency) => set({ currency, selectedTier: null }),
  setDonorName: (name) => set({ donorName: name }),
  setPrayerName: (name) => set({ prayerName: name }),
  setSaveCard: (v) => set({ saveCard: v }),
  setProcessing: (v) => set({ isProcessing: v }),
  setSuccess: (v) => set({ isSuccess: v }),
  setError: (msg) => set({ error: msg }),
  reset: () => set(INITIAL as DonationStore),
}));

export const selectFinalAmount = (s: DonationStore): number =>
  s.customAmount ?? s.selectedTier?.amount ?? 0;
