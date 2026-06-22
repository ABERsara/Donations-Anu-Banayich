import type { Currency } from './donation.types';
import type { SupportedLang } from './i18n.types';

export interface AppUser {
  id: string;
  firebaseUid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  preferredLang: SupportedLang;
  preferredCurrency: Currency;
  stripeCustomerId?: string;
  /** 4 ספרות אחרונות של הכרטיס — תצוגה בלבד, לא לעיבוד! */
  savedCardLast4?: string;
  savedCardBrand?: 'visa' | 'mastercard' | 'amex';
  hasSavedCard: boolean;
  isAnonymous: boolean;
  createdAt: string;
}

export interface AuthState {
  user: AppUser | null;
  firebaseToken: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string;
  preferredLang?: SupportedLang;
  preferredCurrency?: Currency;
}
