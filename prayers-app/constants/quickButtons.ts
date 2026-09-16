import type { SupportedLang } from '@/types/i18n.types';
import type { Currency } from '@/types/donation.types';
import type { PrayerSlug } from '@/types/prayer.types';

export interface QuickButton {
  slug: string;
  emoji: string;
  label: Record<SupportedLang, string>;
  prayerSlug: PrayerSlug;
  defaultAmount: Record<Currency, number>;
}

export const QUICK_BUTTONS: QuickButton[] = [
  {
    slug: 'exam',
    emoji: '📚',
    label: {
      he: 'יש לי בחינה',
      en: 'I have an exam',
      fr: "J'ai un examen",
      ru: 'У меня экзамен',
      es: 'Tengo un examen',
      ar: 'لدي امتحان',
    },
    prayerSlug: 'exam',
    defaultAmount: { ILS: 7200, USD: 1800, EUR: 1800, GBP: 1500, ARS: 200000 },
  },
  {
    slug: 'flight',
    emoji: '✈️',
    label: {
      he: 'אני יוצא לטוס',
      en: "I'm flying",
      fr: "Je prends l'avion",
      ru: 'Я лечу',
      es: 'Voy a volar',
      ar: 'أنا أسافر بالطائرة',
    },
    prayerSlug: 'travel',
    defaultAmount: { ILS: 7200, USD: 1800, EUR: 1800, GBP: 1500, ARS: 200000 },
  },
  {
    slug: 'surgery',
    emoji: '🏥',
    label: {
      he: 'לפני ניתוח',
      en: 'Before surgery',
      fr: 'Avant une opération',
      ru: 'Перед операцией',
      es: 'Antes de una cirugía',
      ar: 'قبل العملية',
    },
    prayerSlug: 'health',
    defaultAmount: { ILS: 18000, USD: 5000, EUR: 5000, GBP: 4000, ARS: 500000 },
  },
  {
    slug: 'birth',
    emoji: '👶',
    label: {
      he: 'לפני לידה',
      en: 'Before birth',
      fr: "Avant l'accouchement",
      ru: 'Перед родами',
      es: 'Antes del parto',
      ar: 'قبل الولادة',
    },
    prayerSlug: 'baby',
    defaultAmount: { ILS: 7200, USD: 1800, EUR: 1800, GBP: 1500, ARS: 200000 },
  },
  {
    slug: 'job_interview',
    emoji: '💼',
    label: {
      he: 'ראיון עבודה',
      en: 'Job interview',
      fr: "Entretien d'embauche",
      ru: 'Собеседование',
      es: 'Entrevista de trabajo',
      ar: 'مقابلة عمل',
    },
    prayerSlug: 'success',
    defaultAmount: { ILS: 7200, USD: 1800, EUR: 1800, GBP: 1500, ARS: 200000 },
  },
];
