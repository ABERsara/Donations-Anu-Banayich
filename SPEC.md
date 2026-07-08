# מפרט עבודה — מערכת תפילות
**פרקטיקום סניף | ינואר 2026 | צוות: 2 ג'וניוריות**

---

## מה כבר קיים — לא נוגעים

| קובץ / תיקייה | מה יש |
|---|---|
| `backend/app/models/models.py` | כל המודלים מלאים: Prayer, User, Donation, QuickButton, Category, RecurringDonation |
| `backend/app/schemas/schemas.py` | Pydantic schemas: DonationCreate, DonationResponse, UserResponse, PrayerResponse |
| `backend/app/routers/` | Skeleton לכל ה-endpoints — מבנה מוגדר, הכל TODO |
| `backend/app/services/` | Skeleton לכל ה-services — חתימות פונקציות מוגדרות, הכל NotImplementedError |
| `backend/app/main.py` | FastAPI app, CORS, rate limit, routers — עובד |
| `backend/docker-compose.yml` | PostgreSQL + Alembic config — מוכן |
| `prayers-app/services/firebase.ts` | `initializeApp`, `signInAnon`, `getIdToken` — עובד |
| `prayers-app/services/stripe.ts` | `initializeStripe`, `openPaymentSheet` skeleton |
| `prayers-app/store/authStore.ts` | Zustand store מלא: user, token, setters, selectors |
| `prayers-app/constants/` | `DONATION_TIERS`, `QUICK_BUTTONS`, `APP_CONFIG`, `ROUTES`, `API`, `STORAGE_KEYS` — הכל מלא |
| `prayers-app/i18n/he.json` | כל המפתחות בעברית — מלא |
| `prayers-app/types/` | TypeScript interfaces: Prayer, Donation, User, i18n — מלא |
| `prayers-app/components/common/` | Button, Input, BottomSheet, LoadingSpinner — skeleton |

---

## סיכום ספרינטים

```
Sprint 1 (שבועות 1-2)  │ DB + Migration (+prayer_name) + Seed + Prayers API + Prayer UI
Sprint 2 (שבועות 3-4)  │ Stripe Payment Intent + Webhook + DonationWidget + Payment Sheet + Deploy ענן (Render+Vercel)
Sprint 3 (שבועות 5-6)  │ Firebase Auth Middleware + Saved Card + Quick Donate + Quick Buttons UI
Sprint 4 (שבועות 7-8)  │ History + Profile + i18n + RTL + Currency + SEO
Sprint 5 (שבועות 9-10) │ Hardening + Vercel SSR + EAS Mobile + Search + Banner + Error States + Polish
```

---

## Sprint 1 — שבועות 1–2 | "פונדמנט + תפילות"

---

### Backend — פיצ'ר 1: סביבת עבודה עולה

**מה בונים:**
- `docker-compose up` מעלה PostgreSQL בלוקאל
- `.env` מוגדר לפי `.env.example` (DATABASE_URL, STRIPE_SECRET_KEY, FIREBASE credentials)
- `uvicorn app.main:app` עולה ומגיב על `GET /health`
- `GET /docs` (Swagger) עובד ומציג את כל ה-endpoints

**Acceptance:**
- שתי הבנות מריצות `docker-compose up` ו-`uvicorn` בלוקאל
- `GET http://localhost:8000/health` → `{"status": "ok"}`
- `GET http://localhost:8000/docs` → Swagger UI מציג את כל הrouters

---

### Backend — פיצ'ר 2: Migration + Seed

**מה בונים:**

מודל (לפני המיגרציה):
- מוסיפים למחלקת `Donation` ב-`models.py` עמודה `prayer_name = Column(String, nullable=True)` — שם לתפילה, נפרד מ-`donor_name` (שם התורם לקבלה). מוסיפים עכשיו כדי שייכלל כבר במיגרציה הראשונה, בלי מיגרציה שנייה.

Migration:
- `alembic revision --autogenerate -m "initial"` יוצר קובץ migration מהמודלים הקיימים (כולל `prayer_name`)
- `alembic upgrade head` יוצר את כל הטבלאות ב-DB

`backend/scripts/seed.py` — סקריפט פייתון שמכניס ל-DB:
- 5 קטגוריות: `health`, `success`, `exam`, `travel`, `baby`
- 5 תפילות בעברית:

| slug | title_he | category |
|---|---|---|
| `health` | תפילה לרפואה שלמה | health |
| `success` | תפילה להצלחה | success |
| `exam` | תפילה לפני מבחן | exam |
| `travel` | תפילה לנסיעה בטוחה | travel |
| `baby` | תפילה לברכת ילדים | baby |

כל תפילה כוללת: `slug`, `title_he`, `body_he` (טקסט מלא), `seo_keywords_he` (מערך), `seo_description_he` (150 תווים), `category_id`, `is_active=True`

**Acceptance:**
- `python scripts/seed.py` רץ בלי שגיאות
- בפסגרס: `SELECT COUNT(*) FROM prayers` → 5
- `GET /api/prayers` → רשימה של 5 תפילות

---

### Backend — פיצ'ר 3: Prayers API עובד

**מה בונים:**

`backend/app/services/prayer_service.py` (ממלאים ה-TODO):
```python
def list_prayers(db, lang="he"):
    # SELECT כל תפילות פעילות
    # מחזיר title_{lang}, body_{lang} לכל תפילה
    # fallback ל-he אם lang לא קיים

def get_prayer_by_slug(db, slug, lang="he"):
    # SELECT WHERE slug=slug AND is_active=True
    # UPDATE view_count += 1
    # מחזיר תפילה בודדת ממופה לשפה

def list_by_category(db, category, lang="he"):
    # JOIN עם Category WHERE category.slug = category

def search_prayers(db, q, lang="he"):
    # ILIKE על title_{lang} ו-body_{lang}
```

`backend/app/routers/prayers.py` (ממלאים ה-TODO):
- `GET /api/prayers?lang=he` — קורא ל-`list_prayers`, מחזיר `List[PrayerResponse]`
- `GET /api/prayers/{slug}?lang=he` — קורא ל-`get_prayer_by_slug`, מחזיר `PrayerResponse`
- `GET /api/prayers/search?q=&lang=he` — קורא ל-`search_prayers`
- `GET /api/prayers/category/{category}?lang=he` — קורא ל-`list_by_category`

`backend/app/schemas/schemas.py` (עדכון קטן):
- `PrayerResponse` — ממלאים `title`, `body`, `seo_description` לפי lang (mapping מה-model)

**Acceptance:**
- `GET /api/prayers?lang=he` → JSON עם 5 תפילות בעברית
- `GET /api/prayers/health` → תפילת רפואה, `view_count` עולה בכל קריאה
- `GET /api/prayers/search?q=רפואה` → מחזיר תפילות עם "רפואה" בטקסט

---

### Frontend — פיצ'ר 4: Setup בסיסי

**מה בונים:**

`prayers-app/app/_layout.tsx` (עדכון):
- קריאה ל-`i18n/index.ts` — אתחול i18next עם he בלבד לעכשיו
- `StripeProvider publishableKey={...}` עוטף את האפליקציה
- `signInAnon()` מ-`services/firebase.ts` — נקרא בשקט ברקע בפתיחה

`prayers-app/services/api.ts` (ממלאים):
```typescript
// fetch wrapper בסיסי:
// - BASE URL מ-EXPO_PUBLIC_API_URL
// - headers: Content-Type: application/json
// - אם יש token ב-authStore → Authorization: Bearer <token>
// - throw Error על status >= 400
async function apiFetch(endpoint, options?)
```

**Acceptance:**
- אפליקציה נפתחת בלי קריסות
- Firebase Anonymous user נוצר (ניתן לראות ב-Firebase Console)
- `apiFetch('/api/prayers')` מחזיר נתונים

---

### Frontend — פיצ'ר 5: מסך הבית — רשימת תפילות

**מה בונים:**

`prayers-app/hooks/usePrayer.ts` (ממלאים ה-TODO):
```typescript
// usePrayers() — GET /api/prayers?lang={currentLang}
// מחזיר: { prayers: Prayer[], isLoading: boolean, error: string | null }

// usePrayer(slug) — GET /api/prayers/{slug}?lang={currentLang}
// מחזיר: { prayer: Prayer | null, isLoading: boolean, error: string | null }
```

`prayers-app/components/PrayerCard/PrayerCard.tsx` (ממלאים):
- כרטיס עם: emoji קטגוריה, כותרת, תיאור קצר (50 תווים ראשונים מה-body)
- לחיצה → `router.push(ROUTES.PRAYER(prayer.slug))`

`prayers-app/app/(tabs)/index.tsx` (ממלאים ה-TODO):
- `usePrayers()` → `FlatList` של `PrayerCard`
- `QuickButtons` בראש המסך (עדיין ריק, רק placeholder)
- Loading state: `LoadingSpinner`
- Error state: טקסט "שגיאה בטעינה, נסה שוב"

**Acceptance:**
- מסך הבית מציג 5 תפילות בכרטיסים
- Loading spinner מוצג בזמן טעינה
- לחיצה על כרטיס → מנווטת לעמוד תפילה

---

### Frontend — פיצ'ר 6: עמוד תפילה

**מה בונים:**

`prayers-app/app/prayer/[slug].tsx` (עדכון ה-skeleton הקיים):
- `usePrayer(slug)` שולף נתונים
- `ScrollView` עם:
  - כותרת גדולה `prayer.title`
  - טקסט תפילה מלא `prayer.body`
- `DonationWidget` ב-sticky bottom (מציג כפתורי סכום בלבד, ללא לוגיקה — עדיין TODO)
- Loading state: `LoadingSpinner` על כל המסך
- Not-found state: "תפילה לא נמצאה" + כפתור חזרה

**Acceptance:**
- לוחצים על "תפילה לרפואה" → עמוד עם טקסט מלא
- כפתורי ₪18 / ₪36 / ₪72 מוצגים בתחתית (לא עובדים עדיין)
- כפתור חזרה עובד

---

## Sprint 2 — שבועות 3–4 | "תרומה בסיסית"

---

### Backend — פיצ'ר 1: Stripe Payment Intent

**מה בונים:**

`backend/app/services/stripe_service.py` (ממלאים ה-TODO):
```python
async def create_payment_intent(amount, currency, customer_id=None):
    # stripe.PaymentIntent.create(
    #   amount=amount,
    #   currency=currency.lower(),
    #   customer=customer_id,  # None בשלב זה
    #   automatic_payment_methods={"enabled": True}
    # )
    # מחזיר: {"client_secret": ..., "payment_intent_id": ...}

def construct_webhook_event(payload, sig_header):
    # stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
```

`backend/app/services/donation_service.py` (ממלאים ה-TODO):
```python
async def create_pending_donation(db, body: DonationCreate, uid=None):
    # 1. stripe_service.create_payment_intent(body.amount, body.currency)
    # 2. INSERT Donation(status="pending", stripe_payment_intent_id=..., ...)
    # 3. מחזיר DonationResponse(client_secret=..., payment_intent_id=...)

async def confirm_donation(db, payment_intent_id):
    # UPDATE donations SET status="success" WHERE stripe_payment_intent_id=...
```

`backend/app/routers/donations.py` (ממלאים):
- `POST /api/donations/initiate` → קורא ל-`create_pending_donation`, מחזיר `DonationResponse`
- `POST /api/donations/confirm` → קורא ל-`confirm_donation`

**Acceptance:**
- מוסיפים `prayer_name: str | None = None` ל-`DonationCreate`; השרת שומר אותו אם הגיע (לא אוכף את הסף — האכיפה ב-UI)
- `POST /api/donations/initiate` עם `{prayer_id, amount: 7200, currency: "ILS", donor_name: "שרה", prayer_name: "יוסף בן רחל"}` → מקבל `client_secret` אמיתי מ-Stripe
- DB: donation נוצרת עם `status="pending"`
- `POST /api/donations/confirm` → `status="success"`

---

### Backend — פיצ'ר 2: Stripe Webhook

**מה בונים:**

`backend/app/routers/webhooks.py` (ממלאים):
```python
POST /api/webhooks/stripe:
  # 1. construct_webhook_event(body, stripe-signature header)
  # 2. if event.type == "payment_intent.succeeded":
  #      confirm_donation(db, event.data.object.id)
  # 3. if event.type == "payment_intent.payment_failed":
  #      UPDATE status="failed"
  # 4. return {"received": True}
```

**Acceptance:**
- ב-Stripe Dashboard → Webhooks → Send test event → `payment_intent.succeeded`
- DB: donation מעודכנת ל-`status="success"` אוטומטית

---

### Frontend — פיצ'ר 3: DonationWidget — בחירת סכום

**מה בונים:**

`prayers-app/store/donationStore.ts` (ממלאים):
```typescript
interface DonationStore {
  selectedAmount: number | null   // סנטים/אגורות
  currency: Currency              // ILS ברירת מחדל
  isBottomSheetOpen: boolean
  selectTier: (amount: number) => void
  openBottomSheet: () => void
  closeBottomSheet: () => void
  reset: () => void
}
```

`prayers-app/constants/donations.ts` (מוסיפים):
- קבוע סף `PRAYER_NAME_MIN_AMOUNT` (per-currency, ILS=7200) — ממנו ומעלה ייפתח שדה "שם לתפילה" ב-BottomSheet

`prayers-app/components/DonationWidget/DonationWidget.tsx` (ממלאים ה-TODO):
- `currency` מ-store (ILS עד Sprint 4)
- לולאה על `DONATION_TIERS[currency]` → כפתור לכל סכום
- כפתור נבחר = styled אחרת (border / background שונה)
- כפתור "אחר" → `TextInput` לסכום חופשי
- כפתור "תרום" → פותח את ה-bottom sheet (state מקומי / רכיב BottomSheet; שים לב: ל-`donationStore` אין `isBottomSheetOpen`)

**Acceptance:**
- כפתורי ₪18 / ₪36 / ₪72 / ₪180 / ₪360 / אחר מוצגים
- לחיצה מסמנת כנבחר (highlight)
- כפתור "תרום" פותח bottom sheet

---

### Frontend — פיצ'ר 4: DonationBottomSheet + Stripe Payment Sheet

**מה בונים:**

`prayers-app/services/stripe.ts` (עדכון):
```typescript
async function openPaymentSheet(clientSecret: string): Promise<boolean>
  // 1. initPaymentSheet({ paymentIntentClientSecret: clientSecret, merchantDisplayName: "תפילות" })
  // 2. presentPaymentSheet()
  // 3. מחזיר true אם הצליח, false אם בוטל/נכשל
```

`prayers-app/hooks/useDonation.ts` (ממלאים ה-TODO):
```typescript
async function initiateDonation(prayerId: string):
  // 1. POST /api/donations/initiate → { client_secret, payment_intent_id }
  // 2. openPaymentSheet(client_secret)
  // 3. אם הצליח → POST /api/donations/confirm
  // 4. donationStore → isSuccess = true
  // 5. אם נכשל → error = "התשלום נכשל"
```

`prayers-app/i18n/he.json` (מוסיפים): `donation.donor_name` (שם תורם לקבלה), `donation.prayer_name` (שם לתפילה)

`prayers-app/components/DonationWidget/DonationBottomSheet.tsx` (ממלאים ה-TODO):
- `TextInput` לשם תורם (required, לקבלה)
- אם `selectFinalAmount(store) >= PRAYER_NAME_MIN_AMOUNT[currency]` → `TextInput` שני "שם לתפילה" (optional, נפרד משם התורם)
- הסכום הנבחר מ-store מוצג בכפתור: "אשר תרומה של ₪72"
- לחיצה → `useDonation().initiateDonation(prayerId)` עם `donor_name` ו-`prayer_name`
- בזמן עיבוד: `isProcessing=true` → spinner + כפתור disabled
- אם `isSuccess=true` → מציג `SuccessAnimation`, סוגר bottom sheet

`prayers-app/components/DonationWidget/SuccessAnimation.tsx` (ממלאים):
- אנימציה בסיסית: checkmark + "תפילתך נשלחה ✨" (Animated API)

**Acceptance:**
- בוחרים ₪72 → כותבים שם → לוחצים אשר → Stripe UI נפתח
- מזינים כרטיס טסט `4242 4242 4242 4242` → מאשרים
- מוצגת אנימציית הצלחה "תפילתך נשלחה ✨"
- בוחרים ₪72 (מעל הסף) → שדה "שם לתפילה" מופיע; בוחרים ₪18 (מתחת לסף) → לא מופיע
- ב-DB: donation עם `status="success"`, `amount=7200`, `donor_name="שרה"`, `prayer_name="יוסף בן רחל"`

---

### פיצ'ר 5: עלייה לענן — staging (Render + Vercel)

**מה בונים:**

Backend ל-Render:
- PostgreSQL managed + Web Service: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment variables ב-Render (DATABASE_URL, STRIPE_*, FIREBASE_*, ALLOWED_ORIGINS)
- הרצת `alembic upgrade head` ו-`scripts/seed.py` פעם אחת על ה-DB המנוהל
- `backend/app/core/config.py` — `cors_origins` כולל את כתובת Vercel

Web ל-Vercel:
- Import repo → build `npx expo export --platform web`
- `EXPO_PUBLIC_*` (כש-`EXPO_PUBLIC_API_URL` מצביע על Render)

**Acceptance:**
- `https://<app>.onrender.com/health` → 200, `/api/prayers` מחזיר 5
- `https://<app>.vercel.app` מציג תפילות מה-backend החי
- תרומת טסט מקצה לקצה עובדת בסביבה החיה
- סודות רק ב-env של הפלטפורמות, לא ב-git; `.env.example` מעודכן

---

## Sprint 3 — שבועות 5–6 | "Auth + כרטיס שמור + Quick Buttons"

---

### Backend — פיצ'ר 1: Firebase Auth Middleware

**מה בונים:**

`backend/app/main.py` (עדכון — מסיר TODO):
```python
import firebase_admin
from firebase_admin import credentials
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)
```

`backend/app/middleware/auth.py` (ממלאים ה-TODO):
```python
async def verify_firebase_token(authorization: str = Header(...)):
    # 1. מחלץ token מ-"Bearer <token>"
    # 2. firebase_auth.verify_id_token(token) → { uid, email, name }
    # 3. user_service.get_or_create_user(db, uid, email, name)
    # 4. מחזיר User object

async def optional_firebase_token(authorization: str = Header(default="")):
    # אותו דבר אבל מחזיר None אם אין header (לתרומות ללא רישום)
```

`backend/app/services/user_service.py` (ממלאים):
```python
def get_or_create_user(db, firebase_uid, email=None, display_name=None):
    # SELECT WHERE firebase_uid = firebase_uid
    # אם לא קיים → INSERT User(firebase_uid, email, display_name)
    # מחזיר User

def get_user_by_uid(db, firebase_uid):
    # SELECT WHERE firebase_uid = firebase_uid
```

**Acceptance:**
- `POST /api/donations/initiate` עם `Authorization: Bearer <firebase_token>` → עובד
- אותו endpoint בלי header → עובד (anonymous)
- `POST /api/donations/quick` בלי header → 401
- Firebase Console: user נוצר בDB לאחר לוגין ראשון

---

### Backend — פיצ'ר 2: שמירת כרטיס ב-Stripe

**מה בונים:**

`backend/app/services/stripe_service.py` (ממלאים):
```python
async def create_or_get_customer(email, firebase_uid):
    # stripe.Customer.create(email=email, metadata={"firebase_uid": firebase_uid})
    # מחזיר customer.id

async def attach_payment_method(customer_id, payment_method_id):
    # stripe.PaymentMethod.attach(payment_method_id, customer=customer_id)
    # stripe.Customer.modify(customer_id, invoice_settings={"default_payment_method": pm_id})

async def detach_payment_method(payment_method_id):
    # stripe.PaymentMethod.detach(payment_method_id)
    # מחזיר None
```

`backend/app/services/donation_service.py` (עדכון `confirm_donation`):
```python
async def confirm_donation(db, payment_intent_id, save_card=False, uid=None):
    # 1. עדכון status="success" כמו קודם
    # 2. אם save_card=True ו-uid קיים:
    #    a. stripe_service.create_or_get_customer(user.email, uid)
    #    b. שליפת payment_method מ-payment_intent (stripe.PaymentIntent.retrieve)
    #    c. stripe_service.attach_payment_method(customer_id, pm_id)
    #    d. UPDATE User: stripe_customer_id, saved_card_last4, saved_card_brand, has_saved_card=True
```

`backend/app/routers/users.py` (ממלאים):
```python
GET  /api/users/me    → Depends(verify_firebase_token) → UserResponse
PATCH /api/users/me   → עדכון preferred_lang / preferred_currency
DELETE /api/users/me/card:
    # stripe_service.detach_payment_method(user's payment_method_id)
    # UPDATE User: has_saved_card=False, saved_card_last4=None, saved_card_brand=None, stripe_customer_id=None
```

**Acceptance:**
- תורמים + מסמנים "שמור כרטיס" → `GET /api/users/me` → `has_saved_card: true, saved_card_last4: "4242"`
- `DELETE /api/users/me/card` → `GET /api/users/me` → `has_saved_card: false`

---

### Backend — פיצ'ר 3: Quick Donate

**מה בונים:**

`backend/app/services/stripe_service.py` (ממלאים):
```python
async def charge_saved_card(customer_id, amount, currency):
    # 1. stripe.PaymentMethod.list(customer=customer_id, type="card") → שולף pm הראשון
    # 2. stripe.PaymentIntent.create(
    #      amount=amount, currency=currency,
    #      customer=customer_id,
    #      payment_method=pm.id,
    #      confirm=True,
    #      off_session=True
    #    )
    # מחזיר payment_intent_id
```

`backend/app/services/donation_service.py` (ממלאים):
```python
async def quick_donation(db, body: DonationCreate, user: User):
    # 1. בדיקה: user.has_saved_card — אם לא → HTTPException 400
    # 2. stripe_service.charge_saved_card(user.stripe_customer_id, body.amount, body.currency)
    # 3. INSERT Donation(status="success", ...)
    # 4. מחזיר {"status": "success", "amount": body.amount}
```

`backend/app/routers/donations.py` (ממלאים `quick_donate`):
- `POST /api/donations/quick` → `Depends(verify_firebase_token)` → `quick_donation`

**Acceptance:**
- משתמש עם `has_saved_card=true` → `POST /api/donations/quick {prayer_id, amount: 7200, currency: "ILS", donor_name: "מיכל"}` → 200, donation נשמרת
- בלי כרטיס שמור → 400

---

### Frontend — פיצ'ר 4: Firebase Auth Flow

**מה בונים:**

`prayers-app/hooks/useAuth.ts` (ממלאים ה-TODO):
```typescript
// onAuthStateChanged מ-Firebase:
//   → setUser(user), setToken(token)
//   → GET /api/users/me עם token → מעדכן user ב-store עם hasSavedCard, last4, brand
//
// בפתיחה — אם אין currentUser → signInAnon() (שקט)
//
// useSignOut():
//   → signOutUser()
//   → authStore.reset()
//   → router.replace('/auth/login')
```

`prayers-app/app/auth/login.tsx` (ממלאים):
- כפתור "התחבר עם Google":
  - `expo-auth-session` / `expo-google-sign-in` → מקבל credential
  - `signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`
  - אם היה anonymous user → `linkWithCredential` (שמירת היסטוריה)
- כפתור "התחבר עם Apple" — מוצג רק על `Platform.OS === 'ios'`

`prayers-app/app/_layout.tsx` (עדכון):
- `useAuth()` נקרא כאן כדי שה-store מתאתחל עם כל פתיחה

**Acceptance:**
- פותחים אפליקציה → anonymous sign-in שקט (ללא מסך)
- לוחצים "התחבר עם Google" → OAuth flow → `authStore.user` מלא
- `GET /api/users/me` עובד עם ה-token החדש

---

### Frontend — פיצ'ר 5: Bottom Sheet מזהה כרטיס שמור

**מה בונים:**

`prayers-app/components/DonationWidget/DonationBottomSheet.tsx` (עדכון):
```typescript
const hasSavedCard = useAuthStore(selectHasSavedCard)
const { last4, brand } = useAuthStore(s => s.user) ?? {}

// אם hasSavedCard:
//   → מציג "{brand} ****{last4}"
//   → כפתור "אשר תרומה של ₪72" → quickDonate()
// אחרת:
//   → מציג Stripe Payment Sheet כמו קודם
//   → checkbox "שמור כרטיס לפעם הבאה" → save_card: true ב-request
```

`prayers-app/hooks/useDonation.ts` (עדכון):
```typescript
async function quickDonate(prayerId: string, quickButtonSlug?: string):
  // POST /api/donations/quick עם Authorization header
  // → donationStore.isSuccess = true
```

**Acceptance:**
- משתמש עם כרטיס שמור → bottom sheet מציג "VISA ****4242" ו-1 כפתור
- לחיצה → 2 שניות → "תפילתך נשלחה ✨"
- משתמש בלי כרטיס → Stripe Payment Sheet כרגיל + checkbox "שמור כרטיס"

---

### Frontend — פיצ'ר 6: Quick Buttons פועלים

**מה בונים:**

`prayers-app/components/QuickButtons/QuickButtons.tsx` (ממלאים ה-TODO):
```typescript
// מציג QUICK_BUTTONS מ-constants/quickButtons.ts
// כל כפתור: emoji + label[currentLang]
// לחיצה → פותח bottom sheet עם:
//   - שם (TextInput)
//   - סכום: button.default_amount[currency]
//   - כרטיס שמור (אם יש)
//   - כפתור "שלח תפילה + תרום" → useDonation().quickDonate(button.prayer_slug, button.slug)
```

**Acceptance:**
- מסך הבית מציג 5 כפתורים: ✈️ ✏️ 🏥 👶 💼
- לחיצה "יש לי מבחן" → bottom sheet עם ₪72 + VISA ****4242
- אשר → "תפילתך נשלחה ✨"

---

## Sprint 4 — שבועות 7–8 | "פרופיל + i18n + SEO + מטבע"

---

### Backend — פיצ'ר 1: היסטוריית תרומות

**מה בונים:**

`backend/app/services/donation_service.py` (מוסיפים):
```python
def list_history(db, user_id, limit=20):
    # SELECT donations WHERE user_id=user_id
    # ORDER BY created_at DESC LIMIT 20
    # מחזיר רשימה עם: amount, currency, donor_name, status, created_at, prayer slug/title
```

`backend/app/routers/donations.py` (ממלאים `donation_history`):
- `GET /api/donations/history` → `Depends(verify_firebase_token)` → `list_history`

**Acceptance:**
- `GET /api/donations/history` עם token → רשימת 20 התרומות האחרונות של המשתמש
- מוין מחדש לישן

---

### Backend — פיצ'ר 2: Seed רב-לשוני

**מה בונים:**

`backend/scripts/seed.py` (עדכון):
- 5 תפילות קיימות + הוספת שדות אנגלית:
  - `title_en`, `body_en`
  - `seo_keywords_en`, `seo_description_en`

`backend/app/services/prayer_service.py` (עדכון `search_prayers`):
```python
def search_prayers(db, q, lang="he"):
    # ILIKE על title_{lang} ו-body_{lang} ו-seo_keywords_{lang}
    # fallback: אם אין column ל-lang → חוזר ל-he
```

**Acceptance:**
- `GET /api/prayers?lang=en` → 5 תפילות באנגלית
- `GET /api/prayers/search?q=healing&lang=en` → תוצאות רלוונטיות

---

### Frontend — פיצ'ר 3: מסך פרופיל

**מה בונים:**

`prayers-app/app/(tabs)/profile.tsx` (ממלאים):

**אם לא מחובר (`!selectIsLoggedIn`):**
- כפתור "התחבר עם Google" → navigate ל-`/auth/login`
- הודעה: "התחבר כדי לצפות בהיסטוריית התרומות שלך"

**אם מחובר:**

סקציה 1 — פרטי משתמש:
- `display_name` + `email` מ-store

סקציה 2 — כרטיס שמור:
- אם `hasSavedCard`: "{brand} ****{last4}" + כפתור "מחק כרטיס"
  - לחיצה → Alert "בטוח?" → `DELETE /api/users/me/card` → מעדכן store
- אחרת: "אין כרטיס שמור"

סקציה 3 — היסטוריית תרומות:
- `GET /api/donations/history` → `FlatList`
- כל שורה: תאריך + שם תפילה + סכום + סטטוס
- Empty state: "עדיין לא תרמת"

כפתור "התנתק":
- `signOutUser()` → `authStore.reset()` → navigate `/`

**Acceptance:**
- פרופיל מציג שם, כרטיס, היסטוריה
- "מחק כרטיס" → bottom sheet חוזר ל-Stripe Payment Sheet
- "התנתק" → חוזר למסך הבית כ-anonymous

---

### Frontend — פיצ'ר 4: Language Picker + RTL/LTR

**מה בונים:**

`prayers-app/store/languageStore.ts` (ממלאים):
```typescript
interface LanguageStore {
  lang: SupportedLang        // ברירת מחדל: he
  isRTL: boolean             // he/ar → true
  currency: Currency         // ברירת מחדל: ILS
  setLanguage: (lang) => void  // שומר ב-AsyncStorage + i18n.changeLanguage()
  setCurrency: (c) => void
}
```

`prayers-app/hooks/useLanguage.ts` (ממלאים):
```typescript
// detectPreferredLanguage() מ-utils/detectLanguage.ts → setLanguage בפתיחה ראשונה
// changeLanguage(lang) → languageStore.setLanguage(lang)
```

`prayers-app/components/LanguagePicker/LanguagePicker.tsx` (ממלאים):
- Modal / ActionSheet עם 6 שפות: 🇮🇱 עברית / 🇬🇧 English / 🇫🇷 Français / 🇷🇺 Русский / 🇦🇷 Español / 🇸🇦 عربי
- לחיצה → `changeLanguage(lang)` → UI משתנה מיד

`prayers-app/app/_layout.tsx` (עדכון):
- קריאה ל-`languageStore` → `I18nManager.forceRTL(isRTL)` + `direction` על root View

`prayers-app/i18n/` — משלימים קבצים:

כל הקבצים צריכים בדיוק את אותם מפתחות כמו `he.json`:
- `en.json` — English
- `fr.json` — Français
- `ru.json` — Русский
- `es.json` — Español
- `ar.json` — عربي (RTL)

**Acceptance:**
- פותחים LanguagePicker → בוחרים FR → כל UI בצרפתית מיד
- בוחרים ערבית → UI מתהפך ל-RTL (כיוון טקסט, כיוון רשימות)
- בחירה נשמרת לאחר סגירת האפליקציה

---

### Frontend — פיצ'ר 5: Geo-IP Currency Detection

**מה בונים:**

`prayers-app/hooks/useCurrency.ts` (ממלאים):
```typescript
// בפתיחה:
// 1. בדוק STORAGE_KEYS.PREFERRED_CURRENCY ב-AsyncStorage
// 2. אם לא קיים → utils/detectCurrency.ts (ipapi.co)
// 3. languageStore.setCurrency(currency)
// Fallback: ILS
```

`prayers-app/components/DonationWidget/DonationWidget.tsx` (עדכון):
- `languageStore.currency` → `DONATION_TIERS[currency]`
- כפתורים מציגים את הסכומים הנכונים לפי מדינה

**Acceptance:**
- VPN לארה"ב → כפתורים: $5 / $10 / $18 / $50 / $100
- ישראל → ₪18 / ₪36 / ₪72 / ₪180 / ₪360
- אירופה → €5 / €10 / €18 / €50

---

### Frontend — פיצ'ר 6: SEO מלא + עמוד תפילה רב-לשוני

**מה בונים:**

`prayers-app/app/prayer/[slug].tsx` (עדכון):
```typescript
// generateMetadata({ params }):
export async function generateMetadata({ params }) {
  const prayer = await getPrayer(params.slug, 'he')
  return {
    title: `${prayer.title} | תפילות`,
    description: prayer.seo_description,       // 150 תווים
    keywords: prayer.seo_keywords?.join(', '),
    openGraph: {
      title: prayer.title,
      description: prayer.seo_description,
      type: 'article',
    },
    alternates: {
      canonical: `https://domain.com/prayer/${params.slug}`,
      languages: {
        he: `/prayer/${params.slug}`,
        en: `/en/prayer/${params.slug}`,
        fr: `/fr/prayer/${params.slug}`,
        ru: `/ru/prayer/${params.slug}`,
        es: `/es/prayer/${params.slug}`,
        ar: `/ar/prayer/${params.slug}`,
      }
    }
  }
}

// JSON-LD script tag בתוך ה-render:
// schema.org/Article עם headline, description, inLanguage, publisher
```

`prayers-app/app/[lang]/prayer/[slug].tsx` (ממלאים):
- אותו עמוד בדיוק, מקבל `lang` מ-URL params
- שולח `?lang=fr` ל-API
- `generateMetadata` לפי שפה

**Acceptance:**
- `view-source` על `/prayer/health`:
  - `<title>תפילה לרפואה שלמה | תפילות</title>` ✓
  - `<meta name="description" content="...">` ✓
  - `<link rel="alternate" hreflang="en" href="/en/prayer/health">` × 6 ✓
  - `<script type="application/ld+json">{"@type": "Article"...}</script>` ✓
- `/en/prayer/health` → HTML באנגלית

---

> פיצ'ר מסך חיפוש ופיצ'ר App Download Banner הוזזו לספרינט 5 (איזון עומס — ספרינט 4 היה עמוס). ראו Sprint 5.

---

## Sprint 5 — שבועות 9–10 | "Mobile + חיפוש + באנר + פולישינג + הקשחה"

---

### Backend — פיצ'ר 1: הקשחת ה-backend לפרודקשן

הסביבה כבר חיה ב-Render מספרינט 2 (פיצ'ר 5). כאן מקשיחים אותה לפרודקשן.

**מה בונים:**

Stripe Webhook פרודקשן:
- Stripe Dashboard → Webhooks → Add endpoint → `https://api.yourapp.com/api/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

מפתחות live:
- החלפת מפתחות test ב-live (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

`backend/app/core/config.py` (עדכון):
- `cors_origins` — סגור רק לכתובות הפרודקשן (Vercel)

**Acceptance:**
- `https://api.yourapp.com/health` → 200 OK
- Stripe webhook פרודקשן → donation מתעדכנת ב-production DB; מפתחות live פעילים

---

### Backend — פיצ'ר 2: Rate Limiting מלא

**מה בונים:**

`backend/app/middleware/rate_limit.py` (ממלאים):
```python
# slowapi rate limiter:
# GET endpoints: 100 req/min per IP
# POST /api/donations/*: 10 req/min per IP (מניעת spam)
# POST /api/webhooks/*: ללא הגבלה (Stripe בלבד)
```

**Acceptance:**
- יותר מ-10 תרומות בדקה מאותו IP → 429 Too Many Requests

---

### Frontend — פיצ'ר 3: הפעלת SSR על ה-Vercel הקיים

ה-web כבר חי ב-Vercel מספרינט 2 (פיצ'ר 5). כאן עוברים למצב SSR ל-SEO.

**מה בונים:**

`prayers-app/app.json` (עדכון):
```json
{
  "web": {
    "bundler": "metro",
    "output": "server"
  }
}
```
- `EXPO_PUBLIC_API_URL` → production backend URL

**Acceptance:**
- `view-source` על `/prayer/health` → HTML מלא (לא JS בלבד) — SSR עובד
- Google Search Console — אין שגיאות crawl

---

### Frontend — פיצ'ר 4: EAS Build — iOS + Android

**מה בונים:**

`prayers-app/app.json` (עדכון):
```json
{
  "expo": {
    "name": "תפילות",
    "slug": "prayers-app",
    "version": "1.0.0",
    "ios": { "bundleIdentifier": "com.yourorg.prayersapp" },
    "android": { "package": "com.yourorg.prayersapp" }
  }
}
```

`prayers-app/eas.json`:
```json
{
  "build": {
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

פקודות:
```bash
eas build --platform ios --profile preview     # IPA לטסטרים
eas build --platform android --profile preview # APK לטסטרים
```

הגשה לחנויות:
- App Store Connect → New App → Internal Testing
- Google Play Console → Internal Testing track

**Acceptance:**
- Internal tester מקבל לינק ויכול להתקין
- האפליקציה עובדת על מכשיר אמיתי (iOS + Android)

---

### Frontend — פיצ'ר 5: Error States + Loading States

**מה בונים:**

כל מסך שיש בו `isLoading`:
- `LoadingSpinner` (כבר קיים ב-`components/common/`) — להשתמש בו

כל מסך שיש בו `error`:
- הודעת שגיאה + כפתור "נסה שוב" שקורא ל-refetch

מקרים ספציפיים:
- תרומה נכשלת → Alert "התשלום נכשל, נסה שוב"
- Stripe Payment Sheet בוטל → חוזר ל-bottom sheet (ללא הודעת שגיאה)
- אין חיבור רשת → Banner "אין חיבור לאינטרנט" בראש המסך (`@react-native-community/netinfo`)
- 401 מה-backend → logout אוטומטי + navigate ל-login

**Acceptance:**
- מכבים WiFi → Banner "אין חיבור" → מדליקים → נעלם + נתונים נטענים
- אפליקציה לא קורסת בשום תרחיש שגיאה

---

### Frontend — פיצ'ר 6: UX Polish

**מה בונים:**

`prayers-app/components/DonationWidget/SuccessAnimation.tsx` (שיפור):
- אנימציה מלאה: Lottie (`lottie-react-native`) או Animated API
- גל אור + checkmark + טקסט מתגלגל + haptic success

Haptic Feedback (`expo-haptics`):
- `Haptics.impactAsync(Medium)` על לחיצת כפתורי סכום
- `Haptics.notificationAsync(Success)` על הצלחת תרומה

Keyboard Avoiding:
- `KeyboardAvoidingView` ב-`DonationBottomSheet` → שם התורם לא מוסתר ב-iOS

Tab Bar:
- Icons מלאים עם `@expo/vector-icons`
- Tab הבית: 🏠, חיפוש: 🔍, פרופיל: 👤

Splash Screen + Icon:
- `assets/images/icon.png` — icon של האפליקציה (1024×1024)
- `assets/images/splash.png` — splash screen
- מוגדרים ב-`app.json`

**Acceptance:**
- חוויה חלקה: אנימציות, haptic feedback, אין קפיצות UI
- Splash screen מוצג בטעינה
- Tab bar icons מלאים

---

### Frontend — פיצ'ר 7: מסך חיפוש (הוזז מ-Sprint 4)

**מה בונים:**

`prayers-app/app/(tabs)/search.tsx` (ממלאים):
- `TextInput` לחיפוש עם placeholder בשפה הנוכחית
- debounce 300ms על קלט
- `GET /api/prayers/search?q={q}&lang={lang}` → `FlatList` של `PrayerCard`
- Empty state: "לא נמצאו תפילות עבור '{q}'"
- Initial state (לפני חיפוש): "חפש תפילה לפי נושא"

**Acceptance:**
- מקלידים "רפא" → אחרי 300ms → רשימת תפילות רלוונטיות
- מקלידים "healing" באנגלית → תוצאות

---

### Frontend — פיצ'ר 8: App Download Banner (הוזז מ-Sprint 4)

**מה בונים:**

`prayers-app/components/AppDownloadBanner/AppDownloadBanner.tsx` (ממלאים):
```typescript
// מוצג רק ב-Platform.OS === 'web'
// בדיקת AsyncStorage[DISMISSED_BANNER] — אם נסגר → לא מוצג

// navigator.userAgent:
//   iOS → כפתור "הורד ל-iPhone" → APP_CONFIG.APPLE_STORE_URL
//   Android → כפתור "הורד ל-Android" → APP_CONFIG.GOOGLE_PLAY_URL
//   Desktop → QR code + שני כפתורים

// כפתור X לסגירה → DISMISSED_BANNER=true ב-AsyncStorage
```

**Acceptance:**
- גלישה מ-iPhone → Banner "הורד ל-iPhone" עם לינק לApp Store
- גלישה מ-Android → "הורד ל-Android"
- לחיצת X → Banner נעלם + לא חוזר

---

## הקצאת עבודה — בחירה עצמית (לא A/B)

המודל המעודכן: שתי המפתחות בוחרות משימות בעצמן. כל משימה היא פרוסה אנכית מקצה לקצה (שרת + לקוח + הרצה ובדיקה). אין חלוקת Backend/Frontend קבועה ואין הקצאת בעלים מראש. הסדר היחיד שמחייב הוא תלויות ובלוקרים (🚨 נלקחים ראשונים).

חלוקת המשימות המלאה והמפורטת לבחירה עצמית, כולל Goal / Context / Steps / Acceptance לכל משימה, נמצאת ב:
`.claude/sprint-plans/5-sprint-roadmap-team.md`

שרה (Team Lead) לא לוקחת משימות פיתוח — מתכננת, מבקרת, ומאשרת כל PR לפני מיזוג ל-main. כל PR נבדק גם על ידי המפתחת השנייה.

---

## Sync שבועי בין הבנות

בכל ספרינט יש קובץ/תיקייה משותפת שמשפיעה על שתיים:

| Sprint | נקודות Sync |
|---|---|
| 1 | `types/prayer.types.ts` — schema של Prayer API response |
| 2 | `DonationResponse` type (initiate) + רשימת משתני סביבה ל-deploy ב-`.env.example` |
| 3 | `UserResponse` type — מה ה-backend מחזיר מ-/users/me |
| 4 | `?lang=` query param — format מוסכם ב-API |
| 5 | Environment variables — רשימה מוסכמת ב-`.env.example` |
