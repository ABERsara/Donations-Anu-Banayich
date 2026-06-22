/** מפתחות AsyncStorage / SecureStore */
export const STORAGE_KEYS = {
  PREFERRED_LANG: '@prayers/lang',
  PREFERRED_CURRENCY: '@prayers/currency',
  USER_TOKEN: '@prayers/user_token', // SecureStore בלבד!
  LAST_VIEWED: '@prayers/last_viewed',
  DISMISSED_BANNER: '@prayers/dismissed_banner',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
