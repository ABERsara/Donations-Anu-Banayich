/**
 * TODO: מסך פרופיל
 * - אם לא מחובר: כפתורי Google/Apple/Phone login
 * - אם מחובר: שם, כרטיס שמור, היסטוריית תרומות
 * - LanguagePicker + currency picker
 * - כפתור התנתקות
 */
import React from 'react';
import { View, Text } from 'react-native';
import { LanguagePicker } from '@/components/LanguagePicker';

export default function ProfileScreen() {
  return (
    <View>
      <Text>פרופיל — TODO</Text>
      <LanguagePicker />
    </View>
  );
}
