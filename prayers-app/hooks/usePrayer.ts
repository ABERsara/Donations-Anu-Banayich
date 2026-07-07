import { useState, useEffect } from 'react';

import { getPrayer, getPrayers } from '@/services/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LocalizedPrayer } from '@/types/prayer.types';
import { useLanguage } from './useLanguage';

export function usePrayer(slug: string): {
  prayer: LocalizedPrayer | null;
  isLoading: boolean;
  error: string | null;
} {
  const { lang } = useLanguage();
  const [prayer, setPrayer] = useState<LocalizedPrayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getPrayer(slug, lang)
      .then((data) => setPrayer(data as LocalizedPrayer))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug, lang]);

  return { prayer, isLoading, error };
}

// const mockPrayers: LocalizedPrayer[] = [
//   {
//     id: '1',
//     slug: 'shema-yisrael',
//     title: 'שמע ישראל',
//     body: 'שמע ישראל ה׳ אלוהינו ה׳ אחד...',
//     seoDescription: 'תפילת שמע ישראל',
//     seoKeywords: ['שמע', 'תפילה'],
//     lang: 'he',
//     categoryId: 'daily',
//   },
//   {
//     id: '2',
//     slug: 'tefilat-haderech',
//     title: 'תפילת הדרך',
//     body: 'יהי רצון מלפניך ה׳ אלוהינו...',
//     seoDescription: 'תפילה לפני נסיעה',
//     seoKeywords: ['דרך', 'נסיעה'],
//     lang: 'he',
//     categoryId: 'travel',
//   },
//   {
//     id: '3',
//     slug: 'birkat-hamazon',
//     title: 'ברכת המזון',
//     body: 'נברך שאכלנו משלו...',
//     seoDescription: 'ברכה אחרי אכילה',
//     seoKeywords: ['ברכה', 'מזון'],
//     lang: 'he',
//     categoryId: 'blessings',
//   },
//   {
//     id: '4',
//     slug: 'tefilat-refuah',
//     title: 'תפילת רפואה',
//     body: 'מי שבירך אבותינו...',
//     seoDescription: 'תפילה לרפואה שלמה',
//     seoKeywords: ['רפואה', 'בריאות'],
//     lang: 'he',
//     categoryId: 'health',
//   },
//   {
//     id: '5',
//     slug: 'tefilat-hodaya',
//     title: 'תפילת הודיה',
//     body: 'מודה אני לפניך...',
//     seoDescription: 'תפילת הודיה יומית',
//     seoKeywords: ['הודיה', 'תודה'],
//     lang: 'he',
//     categoryId: 'daily',
//   },
// ];

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
    // Promise.resolve(mockPrayers)
    //   .then((data) => setPrayers(data))
    //   .catch(() => setError('error.loading'))
    //   .finally(() => setIsLoading(false));
    getPrayers()
      .then((data) => setPrayers(data as LocalizedPrayer[]))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [lang]);

  return { prayers, isLoading, error };
}
