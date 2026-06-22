import { API } from '@/constants/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

/** Wrapper בסיסי לכל קריאות ה-backend */
export async function apiFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((rest.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(url, { ...rest, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Prayers ────────────────────────────────────────────────
export const getPrayers = () => apiFetch(API.PRAYERS);
export const getPrayer = (slug: string) => apiFetch(API.PRAYER(slug));
export const searchPrayers = (q: string) =>
  apiFetch(`${API.PRAYERS_SEARCH}?q=${encodeURIComponent(q)}`);

// ─── Donations ──────────────────────────────────────────────
export const initiateDonation = (payload: unknown, token?: string) =>
  apiFetch(API.DONATE_INITIATE, { method: 'POST', body: JSON.stringify(payload), token });

export const confirmDonation = (payload: unknown, token?: string) =>
  apiFetch(API.DONATE_CONFIRM, { method: 'POST', body: JSON.stringify(payload), token });

export const quickDonate = (payload: unknown, token: string) =>
  apiFetch(API.DONATE_QUICK, { method: 'POST', body: JSON.stringify(payload), token });

export const getDonationHistory = (token: string) => apiFetch(API.DONATE_HISTORY, { token });

// ─── User ────────────────────────────────────────────────────
export const getMe = (token: string) => apiFetch(API.ME, { token });
export const updateMe = (payload: unknown, token: string) =>
  apiFetch(API.ME, { method: 'PATCH', body: JSON.stringify(payload), token });
export const deleteCard = (token: string) => apiFetch(API.DELETE_CARD, { method: 'DELETE', token });
