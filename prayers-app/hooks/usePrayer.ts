/**
 * TODO: לממש
 * - fetch GET /api/prayers/:slug
 * - מחזיר LocalizedPrayer לפי lang הנוכחי
 * - cache פשוט (SWR או React Query — לבחור)
 */
import { useState, useEffect } from 'react';

import { getPrayers } from '@/services/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LocalizedPrayer } from '@/types/prayer.types';

export function usePrayer(slug: string): {
  prayer: LocalizedPrayer | null;
  isLoading: boolean;
  error: string | null;
} {
  // TODO: לממש
  return { prayer: null, isLoading: true, error: null };
}
export function usePrayers(): {
  prayers: LocalizedPrayer[];
  isLoading: boolean;
  error: string | null;
} {
  const { lang } = useLanguageStore();
  const [prayers, setPrayers] = useState<LocalizedPrayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getPrayers()
      .then((data) => setPrayers(data as LocalizedPrayer[]))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [lang]);

  return { prayers, isLoading, error };
}
