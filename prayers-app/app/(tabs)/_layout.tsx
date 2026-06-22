/**
 * TAB NAVIGATOR — 3 טאבים תחתיים
 * TODO: להוסיף אייקונים (expo/vector-icons)
 */
import { Tabs } from 'expo-router';
import { useLanguageStore } from '@/store/languageStore';
import { THEME } from '@/constants/theme';

export default function TabsLayout() {
  const { rtl } = useLanguageStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.gold,
        tabBarInactiveTintColor: THEME.inkSubtle,
        tabBarStyle: { backgroundColor: THEME.primary },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'בית' }} />
      <Tabs.Screen name="search" options={{ title: 'חיפוש' }} />
      <Tabs.Screen name="profile" options={{ title: 'פרופיל' }} />
    </Tabs>
  );
}
