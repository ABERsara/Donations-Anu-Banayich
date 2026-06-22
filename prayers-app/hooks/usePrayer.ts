/**
 * TODO: לממש
 * - fetch GET /api/prayers/:slug
 * - מחזיר LocalizedPrayer לפי lang הנוכחי
 * - cache פשוט (SWR או React Query — לבחור)
 */
import type { LocalizedPrayer } from '@/types/prayer.types';

export function usePrayer(slug: string): {
  prayer: LocalizedPrayer | null;
  isLoading: boolean;
  error: string | null;
} {
  // TODO: לממש
  return { prayer: null, isLoading: true, error: null };
}
