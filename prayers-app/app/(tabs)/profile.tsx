/**
 * TODO: מסך פרופיל
 * - אם לא מחובר: כפתורי Google/Apple/Phone login
 * - אם מחובר: שם, כרטיס שמור, היסטוריית תרומות
 * - LanguagePicker + currency picker
 * - כפתור התנתקות
 */
// import React from 'react';
// import { View, Text } from 'react-native';

// export default function ProfileScreen() {
//   return (
//     <View>
//       <Text>פרופיל — TODO</Text>
//     </View>
//   );
// }
import React from 'react';
import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View>
      <Text>פרופיל — TODO</Text>
      {/* TEMP - לבדיקת ABD-62 בלבד, להסיר לפני PR */}
      <Button title="בדיקה זמנית: מסך התחברות" onPress={() => router.push('/auth/login')} />
    </View>
  );
}
