/**
 * TODO: דף הבית
 * מציג: QuickButtons + רשימת קטגוריות + AppDownloadBanner
 * Redirect אוטומטי ל-(tabs)/index
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
