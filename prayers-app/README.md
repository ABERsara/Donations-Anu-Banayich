# prayers-app — Frontend

Expo Router (TypeScript) | iOS · Android · Web (SSR)

---

## התקנה והרצה

### דרישות מקדימות

- **Node.js 20 LTS** — [nodejs.org](https://nodejs.org)
- **npm 10+** (מגיע עם Node)
- אופציונלי: `eas-cli` להרצה על מכשיר אמיתי

```bash
npm install -g eas-cli
```

---

### 1. שכפול + התקנה

```bash
cd prayers-app
npm install
```

---

### 2. משתני סביבה

```bash
cp .env.example .env
```

מלאו את הערכים:

| משתנה                                | איפה מוצאים                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_URL`                | כתובת ה-backend (ברירת מחדל: `http://localhost:8000`)                    |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys |
| `EXPO_PUBLIC_FIREBASE_*`             | Firebase Console → Project Settings → Your Apps                          |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`   | Firebase Console → Auth → Google → Web Client ID                         |

---

### 3. הרצה

#### Dev server (Expo) — נקודת הכניסה הראשית

```bash
npm run dev          # = expo start
# נפתח Expo Dev Tools. ואז:
#   w → Web   |   i → iOS Simulator   |   a → Android Emulator
# או סריקת ה-QR עם אפליקציית Expo Go במכשיר אמיתי
```

#### Web (SSR — מומלץ לפיתוח)

```bash
npm run web
# פותח: http://localhost:8081
```

#### iOS Simulator (Mac בלבד)

```bash
npm run ios
```

#### Android Emulator

```bash
npm run android
```

---

### 4. בדיקות איכות

```bash
npm run type-check    # TypeScript
npm run lint          # ESLint
npm run lint:fix      # ESLint + תיקון אוטומטי
npm run format        # Prettier — מעצב את כל הקבצים
npm run format:check  # Prettier — בדיקה בלבד (כמו ב-CI)
```

> **Husky pre-commit:** בכל `git commit` רץ אוטומטית `lint-staged` (ESLint + Prettier על הקבצים שב-stage).
> אל תעקפו עם `--no-verify`. לקונבנציות הקוד ראו [CONTRIBUTING.md](../CONTRIBUTING.md) ו-[CHECKLIST.md](../CHECKLIST.md).

---

## מבנה תיקיות

```
prayers-app/
├── app/                    # מסכים — Expo Router (file-based routing)
│   ├── _layout.tsx         # ROOT: i18n, Stripe, Firebase init
│   ├── (tabs)/             # ניווט תחתי: בית / חיפוש / פרופיל
│   ├── prayer/[slug].tsx   # עמוד תפילה (SSR + SEO)
│   ├── [lang]/prayer/      # /fr/prayer/health, /en/prayer/...
│   └── auth/               # login, register
│
├── components/
│   ├── common/             # Button ✅ | Input | BottomSheet | LoadingSpinner
│   ├── PrayerCard/         # ✅ דוגמא מלאה
│   ├── DonationWidget/     # TODO
│   ├── QuickButtons/       # TODO
│   ├── LanguagePicker/     # TODO
│   └── AppDownloadBanner/  # TODO
│
├── constants/              # ✅ מלא: DONATION_TIERS, QUICK_BUTTONS, ROUTES, API
├── hooks/                  # useLanguage ✅ | useAuth, usePrayer, useDonation, useCurrency — TODO
├── i18n/                   # he.json ✅ | en/fr/ru/es/ar — TODO למפתחות
├── services/               # firebase.ts ✅ | stripe.ts ✅ | api.ts ✅ | analytics TODO
├── store/                  # authStore ✅ | donationStore ✅ | languageStore ✅
├── types/                  # ✅ מלא: Prayer, Donation, User, i18n
└── utils/                  # ✅ מלא: formatAmount, detectLanguage, detectCurrency, rtl
```

**מקרא:** ✅ = מוכן לשימוש | TODO = ממתין למימוש

---

## קבצי דוגמא

| קובץ                                                     | מה ללמוד ממנו                                       |
| -------------------------------------------------------- | --------------------------------------------------- |
| [Button.tsx](./components/common/Button.tsx)             | קומפוננט עם variants, צבעי הארגון, TypeScript props |
| [PrayerCard.tsx](./components/PrayerCard/PrayerCard.tsx) | ניווט, RTL layout, צבעי הארגון                      |
| [useLanguage.ts](./hooks/useLanguage.ts)                 | hook עם store + i18n + AsyncStorage                 |
| [donationStore.ts](./store/donationStore.ts)             | Zustand store עם selectors                          |

---

## צבעי הארגון

| שם                | HEX       | שימוש                       |
| ----------------- | --------- | --------------------------- |
| נייבי (primary)   | `#1B2A4A` | כפתורים, כותרות, tab bar    |
| זהב (gold/accent) | `#C9A84C` | הדגשות, כפתורי סכום, border |
| לבן               | `#FFFFFF` | רקע כרטיסים                 |

---

## הוספת שפה חדשה

1. צרו `i18n/<קוד>.json` עם **אותם** מפתחות כמו `he.json`
2. הוסיפו ל-`i18n/index.ts` תחת `RESOURCES`
3. הוסיפו ל-`APP_CONFIG.SUPPORTED_LANGS` ב-`constants/app.ts`
4. עדכנו `types/i18n.types.ts` → `SupportedLang`

---

## Build לאפ סטור

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```
