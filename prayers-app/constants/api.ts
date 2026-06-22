const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const API = {
  BASE,

  // ─── Prayers ────────────────────────────────────────────
  PRAYERS: `${BASE}/api/prayers`,
  PRAYER: (slug: string) => `${BASE}/api/prayers/${slug}`,
  PRAYERS_BY_CAT: (cat: string) => `${BASE}/api/prayers/category/${cat}`,
  PRAYERS_SEARCH: `${BASE}/api/prayers/search`,

  // ─── Donations ──────────────────────────────────────────
  DONATE_INITIATE: `${BASE}/api/donations/initiate`,
  DONATE_CONFIRM: `${BASE}/api/donations/confirm`,
  DONATE_QUICK: `${BASE}/api/donations/quick`,
  DONATE_RECURRING: `${BASE}/api/donations/recurring`,
  DONATE_HISTORY: `${BASE}/api/donations/history`,
  DONATE_CANCEL: (id: string) => `${BASE}/api/donations/recurring/${id}`,

  // ─── Users ──────────────────────────────────────────────
  ME: `${BASE}/api/users/me`,
  DELETE_CARD: `${BASE}/api/users/me/card`,
} as const;
