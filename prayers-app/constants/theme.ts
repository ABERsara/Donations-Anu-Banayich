/**
 * טוקני צבע לשימוש ב-StyleSheet / props (color={...}).
 * מקור האמת היחיד הוא theme/colors.json — כאן רק re-export טיפוסי + קיצורים סמנטיים.
 * לעדכון צבע: ערוך את theme/colors.json בלבד.
 */
import colors from '@/theme/colors.json';

export const COLORS = colors;

/** קיצורים נוחים לערכים הנפוצים (StyleSheet לא תומך ב-nested tokens). */
export const THEME = {
  primary: colors.primary.DEFAULT,
  primaryLight: colors.primary.light,
  primaryDark: colors.primary.dark,
  gold: colors.gold.DEFAULT,
  goldLight: colors.gold.light,
  flame: colors.flame.DEFAULT,
  teal: colors.teal.DEFAULT,
  accent: colors.accent,
  surface: colors.surface.DEFAULT,
  card: colors.surface.card,
  ink: colors.ink.DEFAULT,
  inkMuted: colors.ink.muted,
  inkSubtle: colors.ink.subtle,
  white: '#FFFFFF',
} as const;
