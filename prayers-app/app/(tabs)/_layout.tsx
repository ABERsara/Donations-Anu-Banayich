/**
 * TAB NAVIGATOR — 3 טאבים תחתיים
 * TODO: להוסיף אייקונים (expo/vector-icons)
 */
import { Tabs } from 'expo-router';
import { useLanguageStore } from '@/store/languageStore';
import { THEME } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { rtl } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.gold,
        tabBarInactiveTintColor: THEME.inkSubtle,
        tabBarStyle: { backgroundColor: THEME.primary },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('common.tab_home') }} />
      <Tabs.Screen name="search" options={{ title: t('common.tab_search') }} />
      <Tabs.Screen name="profile" options={{ title: t('common.tab_profile') }} />
    </Tabs>
  );
}
