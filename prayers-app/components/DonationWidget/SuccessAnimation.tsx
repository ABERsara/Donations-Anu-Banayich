/**
 * TODO: אנימציית הצלחה לאחר תרומה
 * מציגה: "תפילתך נשלחה ✨" + אנימציה
 * מומלץ: react-native-reanimated (כבר ב-package.json)
 */
import React from 'react';
import { View, Text } from 'react-native';

export function SuccessAnimation() {
  // TODO: להוסיף אנימציה עם Reanimated
  return (
    <View>
      <Text style={{ fontSize: 48 }}>🙏</Text>
      <Text>תפילתך נשלחה ✨</Text>
    </View>
  );
}
