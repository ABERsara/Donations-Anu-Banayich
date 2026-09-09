// /**
//  * TODO: מסך התחברות
//  *
//  * כפתורים (לפי פלטפורמה):
//  *  - Google Sign-In  (Android + Web)
//  *  - Apple Sign-In   (iOS בלבד — חובה ל-App Store!)
//  *  - Phone/SMS OTP
//  *
//  * לאחר התחברות:
//  *  - linkWithCredential אם המשתמש כבר Anonymous
//  *  - עדכון authStore
//  *  - router.back()
//  *
//  * ראה services/firebase.ts
//  */
// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import {
//   auth,
//   GoogleAuthProvider,
//   signInWithCredential,
//   linkWithCredential,
// } from '@/services/firebase';
// import { useRouter } from 'expo-router';
// import { useAuthStore } from '@/store/authStore';

// export default function LoginScreen() {
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false);
//   const [googleError, setGoogleError] = useState<string | null>(null);
//   const router = useRouter();
//   const user = useAuthStore((state) => state.user);

//   useEffect(() => {
//     if (user && !user.isAnonymous) {
//       router.back();
//     }
//   }, [user, router]);

//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
//     });
//   }, []);

//   const handleGoogleSignIn = async () => {
//     setGoogleError(null);
//     setIsGoogleLoading(true);
//     try {
//       await GoogleSignin.hasPlayServices();
//       const { idToken } = await GoogleSignin.signIn();
//       if (!idToken) {
//         throw new Error('לא התקבל idToken מ-Google');
//       }
//       const googleCredential = GoogleAuthProvider.credential(idToken);

//       const currentUser = auth.currentUser;
//       if (currentUser?.isAnonymous) {
//         try {
//           await linkWithCredential(currentUser, googleCredential);
//         } catch (linkErr: any) {
//           if (linkErr?.code === 'auth/credential-already-in-use') {
//             await signInWithCredential(auth, googleCredential);
//           } else {
//             throw linkErr;
//           }
//         }
//       } else {
//         await signInWithCredential(auth, googleCredential);
//       }
//       //useAuth.ts תופס את השינוי דרך onAuthStateChanged ומעדכן את authStore לבד
//     } catch (err) {
//       console.error('Google sign-in error:', err);
//       setGoogleError('ההתחברות עם Google נכשלה. נסי שוב.');
//     } finally {
//       setIsGoogleLoading(false);
//     }
//   };
//   return (
//     <View>
//       <Text>התחברות</Text>
//       <TouchableOpacity onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
//         {isGoogleLoading ? <ActivityIndicator /> : <Text>התחבר עם Google</Text>}
//       </TouchableOpacity>
//       {googleError && <Text>{googleError}</Text>}
//     </View>
//   );
// }
/**
 * TODO: מסך התחברות
 *
 * כפתורים (לפי פלטפורמה):
 *  - Google Sign-In  (Android + Web)
 *  - Apple Sign-In   (iOS בלבד — חובה ל-App Store!)
 *  - Phone/SMS OTP
 *
 * לאחר התחברות:
 *  - linkWithCredential אם המשתמש כבר Anonymous
 *  - עדכון authStore
 *  - router.back()
 *
 * ראה services/firebase.ts
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  auth,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
} from '@/services/firebase';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      router.back();
    }
  }, [user, router]);

  useEffect(() => {
    console.log(
      'Configuring GoogleSignin with webClientId:',
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    );
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    try {
      console.log('Step 1: checking Play Services');
      await GoogleSignin.hasPlayServices();

      console.log('Step 2: calling GoogleSignin.signIn()');
      const { idToken } = await GoogleSignin.signIn();
      console.log('Step 2 result - idToken received:', !!idToken);

      if (!idToken) {
        throw new Error('לא התקבל idToken מ-Google');
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);

      console.log('Step 3: checking current user, isAnonymous:', auth.currentUser?.isAnonymous);
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        try {
          console.log('Step 4a: linkWithCredential');
          await linkWithCredential(currentUser, googleCredential);
        } catch (linkErr: any) {
          console.log('Step 4a failed with code:', linkErr?.code);
          if (linkErr?.code === 'auth/credential-already-in-use') {
            console.log('Step 4b: fallback to signInWithCredential');
            await signInWithCredential(auth, googleCredential);
          } else {
            throw linkErr;
          }
        }
      } else {
        console.log('Step 4: signInWithCredential (not anonymous)');
        await signInWithCredential(auth, googleCredential);
      }
      console.log('Google sign-in flow completed successfully');
      //useAuth.ts תופס את השינוי דרך onAuthStateChanged ומעדכן את authStore לבד
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      console.log('Error code:', err?.code);
      console.log('Error message:', err?.message);
      console.log('Full error object:', JSON.stringify(err, null, 2));
      setGoogleError('ההתחברות עם Google נכשלה. נסי שוב.');
    } finally {
      setIsGoogleLoading(false);
    }
  };
  return (
    <View>
      <Text>התחברות</Text>
      <TouchableOpacity onPress={handleGoogleSignIn} disabled={isGoogleLoading}>
        {isGoogleLoading ? <ActivityIndicator /> : <Text>התחבר עם Google</Text>}
      </TouchableOpacity>
      {googleError && <Text>{googleError}</Text>}
      <TouchableOpacity disabled={true}>
        <Text>התחבר עם Apple</Text>
      </TouchableOpacity>
    </View>
  );
}
