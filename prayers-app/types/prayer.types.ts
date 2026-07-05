import type { SupportedLang } from './i18n.types';

export interface Prayer {
  id: string;
  slug: string;
  categoryId: string;

  // תוכן רב-לשוני
  titleHe: string;
  titleEn: string;
  titleFr: string;
  titleRu: string;
  titleEs: string;
  titleAr: string;

  bodyHe: string;
  bodyEn: string;
  bodyFr: string;
  bodyRu: string;
  bodyEs: string;
  bodyAr: string;

  // SEO
  seoKeywordsHe: string[];
  seoKeywordsEn: string[];
  seoDescriptionHe: string;
  seoDescriptionEn: string;

  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface PrayerCategory {
  id: string;
  slug: string;
  nameHe: string;
  nameEn: string;
  nameFr: string;
  nameRu: string;
  nameEs: string;
  nameAr: string;
  iconUrl?: string;
  order: number;
}

/** ערכי תפילה עבור שפה נתונה — מה שה-UI בפועל רואה */
export interface LocalizedPrayer {
  id: string;
  slug: string;
  title: string;
  body: string;
  seoDescription: string;
  seoKeywords: string[];
  lang: SupportedLang;
  categoryId: string | null;
}

export type PrayerSlug =
  | 'health'
  | 'success'
  | 'exam'
  | 'travel'
  | 'baby'
  | 'marriage'
  | 'livelihood'
  | 'soldiers'
  | (string & {});
