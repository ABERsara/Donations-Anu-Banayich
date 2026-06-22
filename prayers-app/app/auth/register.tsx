/**
 * TODO: מסך הרשמה
 *
 * רוב ההרשמה בפועל מתבצעת דרך ספקי Firebase (Google / Apple / SMS) —
 * ראה app/auth/login.tsx. המסך הזה הוא ל-Email + Password (fallback)
 * או להשלמת פרטים לאחר הרשמה (display_name, שפה, מטבע).
 *
 * לאחר הרשמה:
 *  - linkWithCredential אם המשתמש כבר Anonymous
 *  - יצירת/עדכון User ב-backend (POST/PATCH /api/users/me)
 *  - עדכון authStore
 *  - router.replace('/(tabs)')
 *
 * ראה services/firebase.ts
 */
import React from 'react';
import { View, Text } from 'react-native';

export default function RegisterScreen() {
  return (
    <View>
      <Text>הרשמה — TODO</Text>
    </View>
  );
}
