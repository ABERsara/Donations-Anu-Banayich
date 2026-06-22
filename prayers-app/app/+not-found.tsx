import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'דף לא נמצא' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 24 }}>404 — הדף לא נמצא</Text>
        <Link href="/">חזור לבית</Link>
      </View>
    </>
  );
}
