<div dir="rtl">

# תוכנית 5 ספרינטים — מערכת תפילות

צוות: 2 ג'וניוריות, עבודה מקצה לקצה (שרת + לקוח + הרצה), בחירת משימות עצמית.
מנהלת: שרה (Team Lead, ללא משימות פיתוח, שער אישור אחרון למיזוג ל-`main`).
מקור: `SPEC.md` + בדיקת קוד אמיתית (ראו `sprint-1-basis.md`).

> **איך עובדים עם המסמך:** אין הקצאת בעלים. כל משימה היא פרוסה אנכית שמפתחת אחת לוקחת מקצה לקצה. משימות עם 🚨 BLOCKER נלקחות ראשונות כי הן חוסמות אחרות. כל PR נבדק על ידי המפתחת השנייה, ושרה מאשרת לפני מיזוג.

> **שלושת קבצי הדוגמה** (`services/api.ts`, `store/donationStore.ts`, `store/authStore.ts`) מולאו מראש כדוגמת ייחוס. לא נוגעים בהם, רק מעתיקים מהם סגנון. כל שאר הקוד נכתב מאפס.

> **החלטות מוצר שמוטמעות בתוכנית:**
> 1. **מודל תרומות:** תרומה רגילה (צדקה, כל סכום) + מסף מוגדר ומעלה אפשר להוסיף "שם לתפילה". הסף הוא קבוע `PRAYER_NAME_MIN_AMOUNT` (כרגע ₪72 = 7200 אגורות), לא קשיח. "שם לתפילה" נפרד משם התורם שמשמש לקבלה.
> 2. **באנר וחיפוש** הוזזו מספרינט 4 לספרינט 5 (ספרינט 4 היה עמוס).
> 3. **העלאה לענן הוקדמה לספרינט 2:** deploy של ה-backend ל-Render ושל ה-web ל-Vercel (סביבת staging חיה מוקדם). EAS מובייל, SSR והקשחת פרודקשן נשארים בספרינט 5.

---

## מבט-על

| ספרינט | שבועות | מטרה | פיצ'רים |
|---|---|---|---|
| 1 | 1-2 | פונדמנט + תפילות עולות | 7 |
| 2 | 3-4 | תרומה בסיסית (Stripe) + עלייה לענן | 6 |
| 3 | 5-6 | Auth + כרטיס שמור + Quick Buttons | 6 |
| 4 | 7-8 | פרופיל + רב-לשוני + SEO + מטבע | 6 |
| 5 | 9-10 | Mobile + חיפוש + באנר + פולישינג + הקשחה | 8 |

---
---

# ספרינט 1 — שבועות 1-2 | פונדמנט + תפילות

> **מטרה:** הסביבה עולה אצל שתי הבנות, ה-DB מאוכלס ב-5 תפילות, ה-API מחזיר אותן, ומסך הבית + עמוד התפילה מציגים אותן אמיתית. בסוף הספרינט: גולשת רואה 5 תפילות, נכנסת לאחת, וקוראת את הטקסט המלא.

זהו הספרינט עם הכי הרבה תלות פנימית: שלושת ה-BLOCKERs חייבים להיסגר מוקדם. כדי ששתי הבנות יעבדו במקביל, המפתחת שבוחרת את צד ה-frontend מתחילה מיד על F5 (בוטסטרפ) ו-PrayerCard מול ה-types הקיימים, בלי להמתין לשרת.

---

### Feature — סביבת עבודה ופונדמנט DB

#### F1 🚨 BLOCKER — סביבת עבודה עולה לוקאלית

**Goal:** להעלות את כל ה-stack לוקאלית כך ששתי הבנות יכולות להריץ שרת ו-DB. בלי זה אי אפשר לבדוק כלום, ולכן זו המשימה הראשונה.

**Context:** חוסמת את כל משימות ה-backend (F2-F4) ועקיפות את כל הספרינט. שייכת לתשתית. נוגעת ב-`docker-compose.yml`, `.env`, ו-`uvicorn app.main:app`. אין כאן contract מול ה-frontend, אבל בלי השרת אי אפשר לאמת F6/F7.

**Where to work:** `backend/docker-compose.yml` (קיים, מוכן), `backend/.env` (יוצרים מ-`.env.example`), `backend/app/main.py` (קיים ועובד). אין קוד חדש לכתוב, זו הקמה.

**Steps:**
1. `cp .env.example .env` והשלמת ערכים: `DATABASE_URL`, מפתחות Stripe ו-Firebase (אפשר ערכי test בשלב זה).
2. `docker-compose up` ולוודא ש-PostgreSQL עולה.
3. `uvicorn app.main:app --reload` ולוודא עלייה.
4. לפתוח `GET /health` ו-`GET /docs`.

**Pitfalls:** הסודות לא נכנסים ל-git. לעדכן את `.env.example` אם חסר מפתח. לא לכתוב ערכי connection קשיחים בקוד.

**Proof of done:** צילום מסך של `GET /docs` (Swagger) + פלט `GET /health`.

**Effort:** S
**Dependencies:** none
**Out of scope:** מימוש endpoints (F4), מיגרציה (F2).
**Acceptance criteria:**
- [ ] שתי הבנות הריצו `docker-compose up` ו-`uvicorn` בלוקאל
- [ ] `GET http://localhost:8000/health` מחזיר `{"status":"ok"}`
- [ ] `GET /docs` מציג את כל ה-routers
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג ל-`main`

---

#### F2 🚨 BLOCKER — השלמת מודל התרומה + מיגרציית Alembic ראשונה

**Goal:** להוסיף למודל `Donation` עמודה `prayer_name` (שם לתפילה, נפרד מ-`donor_name` שהוא שם התורם לקבלה), ואז ליצור את כל הטבלאות ב-DB דרך Alembic. עדיף להוסיף את העמודה עכשיו כדי שהמיגרציה הראשונה תכלול אותה, בלי מיגרציה שנייה בהמשך.

**Context:** חוסמת את F3 (seed) ו-F4 (API) — בלי טבלאות אין מה לאכלס או לשלוף. החלטת מוצר: תרומה מסף מסוים ומעלה נושאת "שם לתפילה" נפרד. תשתית backend.

**Where to work:** `backend/app/models/models.py` (מוסיפים שדה אחד למחלקת `Donation`; שאר המודלים מלאים, לא נוגעים), `backend/alembic/versions/` (ריק כרגע, רק `env.py` קיים).

**Steps:**
1. ב-`Donation` להוסיף `prayer_name = Column(String, nullable=True)`.
2. לוודא ש-`env.py` מצביע על `Base.metadata` הנכון.
3. `alembic revision --autogenerate -m "initial"` — נוצר קובץ תחת `versions/`.
4. לוודא שכל 6 הטבלאות שם (prayers, users, donations, recurring_donations, quick_buttons, categories) ושעמודת `prayer_name` נכללה.
5. `alembic upgrade head`.

**Pitfalls:** אסור `ALTER TABLE` ידני או `CREATE TABLE` בקוד — רק דרך Alembic. `prayer_name` חייב להיות `nullable` (תרומות רגילות בלי שם לתפילה). אם autogenerate יוצר מיגרציה ריקה, כנראה `env.py` לא מייבא את המודלים.

**Proof of done:** פלט `alembic upgrade head` תקין + `\d donations` ב-psql שמראה את `prayer_name`.

**Effort:** S
**Dependencies:** F1
**Out of scope:** הכנסת נתונים (F3), לוגיקת הסף בצד לקוח (ספרינט 2).
**Acceptance criteria:**
- [ ] נוספה עמודה `prayer_name` (nullable) ל-`Donation`
- [ ] קובץ מיגרציה נוצר תחת `alembic/versions/` ונכנס ל-git
- [ ] `alembic upgrade head` רץ נקי ויוצר 6 טבלאות כולל `prayer_name`
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F3 🚨 BLOCKER — סקריפט Seed (5 קטגוריות + 5 תפילות בעברית)

**Goal:** לכתוב סקריפט פייתון שמכניס ל-DB 5 קטגוריות ו-5 תפילות מלאות בעברית, כדי שיהיה תוכן אמיתי להציג.

**Context:** חוסמת את F4 (ה-API צריך נתונים להחזיר) ובעקיפין את F6/F7. תשתית backend. הקובץ `backend/scripts/seed.py` לא קיים — net-new.

**Where to work:** ליצור `backend/scripts/seed.py`. להשתמש ב-session מ-`app/database.py` ובמודלים מ-`app/models/models.py`.

**Steps:**
1. ליצור session.
2. להכניס 5 קטגוריות: `health`, `success`, `exam`, `travel`, `baby` (עם `name_he`).
3. להכניס 5 תפילות, כל אחת עם: `slug`, `title_he`, `body_he` (טקסט מלא), `seo_keywords_he` (מערך), `seo_description_he` (150 תווים), `category_id`, `is_active=True`. הצמדה לפי הטבלה ב-`SPEC.md`.
4. להפוך את הסקריפט ל-idempotent (לא ליצור כפילויות בהרצה חוזרת).

**Pitfalls:** `slug` ייחודי — הרצה כפולה לא תשבור. הטקסטים בעברית, לוודא קידוד UTF-8.

**Proof of done:** `SELECT COUNT(*) FROM prayers` מחזיר 5.

**Effort:** M
**Dependencies:** F2
**Out of scope:** שדות אנגלית (ספרינט 4), endpoints (F4).
**Acceptance criteria:**
- [ ] `python scripts/seed.py` רץ בלי שגיאות, וגם פעם שנייה בלי כפילויות
- [ ] 5 קטגוריות ו-5 תפילות בעברית ב-DB עם כל השדות
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — Prayers API

#### F4 — Prayers API עובד (service + router)

**Goal:** למלא את שכבת ה-service וה-router כך שכל 4 ה-endpoints של תפילות מחזירים נתונים אמיתיים מה-DB, ממופים לשפה.

**Context:** זו נקודת ה-Sync המרכזית של הספרינט — מבנה ה-`PrayerResponse` שהשרת מחזיר חייב להתאים ל-`LocalizedPrayer` ב-`types/prayer.types.ts` שה-frontend צורך (F6/F7). יש לסכם את שמות השדות לפני בניית הצד השני. חוסמת את F6 ו-F7.

**Where to work:** `backend/app/services/prayer_service.py` (4 פונקציות sync עם `raise NotImplementedError`), `backend/app/routers/prayers.py` (placeholders), `backend/app/schemas/schemas.py` (`PrayerResponse` יש בו TODO למיפוי שפה).

**Steps:**
1. `prayer_service.list_prayers(db, lang)` — SELECT תפילות פעילות, מיפוי `title_<lang>`/`body_<lang>` עם fallback ל-`he`.
2. `get_prayer_by_slug(db, slug, lang)` — SELECT לפי slug, `is_active=True`, הגדלת `view_count`, החזרה ממופית.
3. `list_by_category` ו-`search_prayers` (ILIKE על `title_<lang>`/`body_<lang>`).
4. למלא `PrayerResponse` עם `title`, `body`, `seo_description` לפי lang.
5. לחבר את ה-router לקרוא ל-service ולהחזיר `List[PrayerResponse]` / `PrayerResponse`.

**Pitfalls:** ה-router נשאר דק — הלוגיקה ב-service. שמות שדות ב-response חייבים להתאים ל-types בלקוח (נקודת ה-Sync). fallback לשפה חסרה, אחרת תפילה ללא `title_fr` תחזיר null.

**Proof of done:** `GET /api/prayers?lang=he` מחזיר 5 תפילות; `GET /api/prayers/health` מגדיל `view_count`; `GET /api/prayers/search?q=רפואה` מחזיר תוצאה.

**Effort:** L
**Dependencies:** F3
**Out of scope:** רב-לשוניות מעבר ל-he (ספרינט 4), auth.
**Acceptance criteria:**
- [ ] 4 ה-endpoints מחזירים נתונים אמיתיים ממופים ל-he
- [ ] `view_count` עולה בכל קריאה לעמוד תפילה
- [ ] שמות השדות ב-`PrayerResponse` סוכמו מול `types/prayer.types.ts` (Sync)
- [ ] לוגיקה ב-service ולא ב-router; קלט/פלט דרך Pydantic
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — בוטסטרפ ומסכי תפילה (Frontend)

#### F5 — בוטסטרפ אפליקציה (i18n + Stripe + Anonymous login)

**Goal:** לאתחל את האפליקציה כך שהיא נפתחת בלי קריסה, עם i18n, עטיפת Stripe, וכניסת Firebase אנונימית שקטה. זו תשתית ה-frontend שכל המסכים נשענים עליה.

**Context:** עבודה שאינה תלויה בשרת — אפשר להתחיל מיד ביום הראשון במקביל ל-BLOCKERs. נוגעת ב-`app/_layout.tsx` ובשירותים הקיימים.

**Where to work:** `prayers-app/app/_layout.tsx` (שלד TODO), `prayers-app/i18n/index.ts`, `prayers-app/services/firebase.ts` (פונקציות `signInAnon`/`getIdToken` כבר עובדות), `prayers-app/services/stripe.ts`.

**Steps:**
1. ב-`_layout.tsx` לקרוא ל-init של i18next (he בלבד כרגע).
2. לעטוף ב-`StripeProvider` עם `publishableKey` מ-`EXPO_PUBLIC_*`.
3. לקרוא ל-`signInAnon()` בשקט ברקע בפתיחה.
4. לאמת מול `authStore` (דוגמת ייחוס) שה-user נשמר.

**Pitfalls:** מפתח Stripe מ-env, לא קשיח. הכניסה האנונימית בלי מסך, ברקע. לא לכתוב כאן `fetch` — רשת דרך `api.ts`.

**Proof of done:** האפליקציה נפתחת; משתמש אנונימי נוצר (נראה ב-Firebase Console).

**Effort:** M
**Dependencies:** none (אפשר להתחיל יום 1)
**Out of scope:** מסך login מלא (ספרינט 3), בחירת שפה (ספרינט 4).
**Acceptance criteria:**
- [ ] האפליקציה נפתחת בלי קריסות
- [ ] משתמש Firebase אנונימי נוצר ברקע
- [ ] מפתחות מגיעים מ-`EXPO_PUBLIC_*`, לא קשיחים
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F6 — מסך הבית: רשימת תפילות

**Goal:** מסך הבית מציג את 5 התפילות בכרטיסים, עם loading ו-error, ולחיצה מנווטת לעמוד התפילה.

**Context:** צורך את F4 (Prayers API). אפשר לבנות את ה-UI ואת `PrayerCard` מול ה-types הקיימים במקביל ל-F4, ולחבר לרשת כשהוא מוכן. נוגע ב-hook, component ומסך.

**Where to work:** `prayers-app/hooks/usePrayer.ts` (יש רק `usePrayer(slug)` — להוסיף `usePrayers()`), `prayers-app/components/PrayerCard/PrayerCard.tsx` (שלד), `prayers-app/app/(tabs)/index.tsx` (כבר מייבא QuickButtons + Banner).

**Steps:**
1. למלא `usePrayers()` שקורא `GET /api/prayers?lang={lang}` דרך `services/api.ts` ומחזיר `{ prayers, isLoading, error }`.
2. `PrayerCard` — emoji קטגוריה, כותרת, 50 תווים ראשונים מ-body; לחיצה `router.push(ROUTES.PRAYER(slug))`.
3. `index.tsx` — `FlatList` של `PrayerCard`, `LoadingSpinner` בטעינה, טקסט שגיאה דרך `t('key')`.

**Pitfalls:** רשת דרך `api.ts` בלבד. אין מחרוזות קשיחות — `t('key')` עם מפתח ב-`he.json`. RTL דרך `utils/rtl`.

**Proof of done:** צילום מסך לפני/אחרי; ה-FlatList מציג 5 כרטיסים; לחיצה מנווטת.

**Effort:** L
**Dependencies:** F4, F5
**Out of scope:** QuickButtons פעילים (ספרינט 3), חיפוש (ספרינט 4).
**Acceptance criteria:**
- [ ] מסך הבית מציג 5 תפילות בכרטיסים
- [ ] Loading ו-error states עובדים
- [ ] לחיצה מנווטת לעמוד תפילה
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F7 — עמוד תפילה (תוכן + states)

**Goal:** עמוד התפילה שולף תפילה לפי slug ומציג כותרת וטקסט מלא, עם DonationWidget (כפתורי סכום בלבד, ללא לוגיקה עדיין) בתחתית דביקה.

**Context:** צורך את F4. ה-skeleton כבר קיים עם `usePrayer` + `DonationWidget`. צריך להשלים את `usePrayer(slug)`, states, ו-not-found.

**Where to work:** `prayers-app/app/prayer/[slug].tsx` (שלד עם תוכן בסיסי), `prayers-app/hooks/usePrayer.ts` (`usePrayer(slug)` stub).

**Steps:**
1. למלא `usePrayer(slug)` שקורא `GET /api/prayers/{slug}` דרך `api.ts`.
2. ScrollView עם כותרת גדולה + body מלא.
3. `LoadingSpinner` בזמן טעינה; מצב not-found עם טקסט + כפתור חזרה (`t('key')`).
4. `DonationWidget` ב-sticky bottom — כפתורי סכום מ-`DONATION_TIERS` בלבד, בלי לוגיקת תשלום.

**Pitfalls:** RTL לטקסט עברי. אין מחרוזות קשיחות. ה-widget לא מבצע תשלום בספרינט הזה.

**Proof of done:** צילום מסך; לחיצה על "תפילה לרפואה" מציגה טקסט מלא; כפתורי ₪18/₪36/₪72 מוצגים.

**Effort:** M
**Dependencies:** F4, F5
**Out of scope:** לוגיקת תרומה (ספרינט 2), SEO (ספרינט 4), תפילות קשורות.
**Acceptance criteria:**
- [ ] עמוד תפילה מציג כותרת + טקסט מלא
- [ ] כפתורי סכום מוצגים (לא פעילים)
- [ ] מצבי loading ו-not-found + כפתור חזרה עובדים
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### מאגר משימות — ספרינט 1

| משימה | פיצ'ר | Effort | תלויות | סטטוס |
|---|---|---|---|---|
| F1 🚨 | סביבה עולה | S | none | available |
| F2 🚨 | מיגרציה | S | F1 | available |
| F3 🚨 | seed | M | F2 | available |
| F4 | Prayers API | L | F3 | available |
| F5 | בוטסטרפ frontend | M | none | available |
| F6 | מסך בית | L | F4, F5 | available |
| F7 | עמוד תפילה | M | F4, F5 | available |

**שרשרת BLOCKERs:** F1 ← F2 ← F3 ← F4 ← (F6, F7). מסלול קריטי. F5 מתחיל במקביל ביום 1.

### קומפוננטות ו-hooks זמינים בסיום ספרינט 1

> **כלל הזהב לכל ספרינט:** לפני כל קומפוננטה חדשה — בדקי את הטבלה. אם קיימת, השתמשי בה כמות שהיא. אל תכתבי מחדש.

| קומפוננטה / hook | ייבוא | סטטוס | מקור |
|---|---|---|---|
| `Button` | `@/components/common` | מלאה | scaffold |
| `LoadingSpinner` | `@/components/common` | עובד | scaffold |
| `Input` | `@/components/common` | stub (ספרינט 2+) | scaffold |
| `AppBottomSheet` | `@/components/common` | stub (ספרינט 2+) | scaffold |
| `PrayerCard` | `@/components/PrayerCard` | דוגמת ייחוס — אל תשנו | scaffold |
| `DonationWidget` | `@/components/DonationWidget` | shell: כפתורי סכום בלבד, ללא תשלום | ספרינט 1 |
| `usePrayers()` | `@/hooks/usePrayer` | מלא | ספרינט 1 |
| `usePrayer(slug)` | `@/hooks/usePrayer` | מלא | ספרינט 1 |

---
---

# ספרינט 2 — שבועות 3-4 | תרומה בסיסית + עלייה לענן

> **מטרה:** משתמשת בוחרת סכום, מזינה שם תורם, ומסף מסוים ומעלה גם "שם לתפילה", משלמת דרך Stripe, ורואה אנימציית הצלחה. בנוסף — סביבת staging חיה בענן (Render + Vercel). בסוף הספרינט: תרומה אמיתית נשמרת ב-DB עם `status="success"`, והאתר חי ברשת.

נקודת Sync: `DonationResponse` (`client_secret`, `payment_intent_id`) + רשימת משתני סביבה ל-deploy.

---

### Feature — Stripe Backend

#### F1 🚨 BLOCKER — Payment Intent + יצירת תרומה pending

**Goal:** ליצור Payment Intent ב-Stripe ולשמור תרומה במצב pending, להחזיר `client_secret` ללקוח.

**Context:** חוסמת את F3/F4 בלקוח — בלי `client_secret` אין מה לפתוח ב-Payment Sheet. נקודת Sync: מבנה `DonationResponse`.

**Where to work:** `backend/app/services/stripe_service.py` (`create_payment_intent` async, TODO), `backend/app/services/donation_service.py` (`create_pending_donation` sync `(db, data, user_uid)`, TODO), `backend/app/routers/donations.py`.

**Steps:**
1. להוסיף `prayer_name: str | None = None` ל-`DonationCreate` ב-`schemas.py` (שם לתפילה, אופציונלי).
2. `create_payment_intent(amount, currency, customer_id=None)` — `stripe.PaymentIntent.create` עם `automatic_payment_methods`.
3. `create_pending_donation` — קורא ל-Stripe, מבצע INSERT Donation `status="pending"` כולל `donor_name` (לקבלה) ו-`prayer_name` אם נשלח, מחזיר `DonationResponse`.
4. `confirm_donation(db, payment_intent_id)` — UPDATE ל-`status="success"`.
5. לחבר `POST /api/donations/initiate` ו-`/confirm` ל-router.

**Pitfalls:** הסכום באגורות (integer), לא float. מפתח Stripe מ-env. הלוגיקה ב-service. השרת לא אוכף את הסף — האכיפה ב-UI; השרת רק שומר `prayer_name` אם הגיע.

**Proof of done:** `POST /initiate` עם `amount:7200, donor_name, prayer_name` מחזיר `client_secret` אמיתי; תרומה נוצרת `pending` עם שני השמות; `/confirm` מעדכן ל-`success`.

**Effort:** L
**Dependencies:** none (ספרינט 1 סגור)
**Out of scope:** webhook (F2), כרטיס שמור (ספרינט 3), אכיפת סף (UI ב-F4).
**Acceptance criteria:**
- [ ] `POST /initiate` מחזיר `client_secret` אמיתי ושומר תרומה `pending` עם `donor_name` ו-`prayer_name`
- [ ] `/confirm` מעדכן ל-`success`
- [ ] סכום נשלח באגורות; מפתח מ-env
- [ ] `DonationResponse` סוכם מול הלקוח (Sync)
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F2 — Stripe Webhook

**Goal:** לקבל אירועי Stripe מאומתי-חתימה ולעדכן את סטטוס התרומה אוטומטית (success/failed).

**Context:** מגבה את F1 — מקור האמת לסטטוס תשלום. עצמאי, אפשר במקביל ל-F1 לאחר שחתימת ה-service מוסכמת.

**Where to work:** `backend/app/routers/webhooks.py` (TODO), `backend/app/services/stripe_service.py` (`construct_webhook_event`).

**Steps:**
1. `construct_webhook_event(payload, sig_header)` עם `STRIPE_WEBHOOK_SECRET`.
2. ב-router: על `payment_intent.succeeded` לקרוא `confirm_donation`; על `payment_intent.payment_failed` לעדכן `failed`.
3. להחזיר `{"received": True}`.

**Pitfalls:** חתימה מאומתת בצד שרת. הסוד מ-env.

**Proof of done:** Stripe Dashboard → Send test event → התרומה מתעדכנת ל-`success`.

**Effort:** M
**Dependencies:** F1
**Out of scope:** rate limiting (ספרינט 5).
**Acceptance criteria:**
- [ ] webhook מאמת חתימה ומעדכן סטטוס אוטומטית
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — תרומה בצד הלקוח

#### F3 — DonationWidget: בחירת סכום

**Goal:** ה-widget מציג כפתורי סכום לפי המטבע, מסמן את הנבחר, תומך ב"סכום אחר", וכפתור "תרום" פותח את ה-bottom sheet.

**Context:** ה-store (`donationStore`) הוא דוגמת ייחוס מלאה — משתמשים בו כמו שהוא (`selectedTier`, `selectFinalAmount`, אין `isBottomSheetOpen` אז פתיחת הגיליון בניהול מקומי/דרך BottomSheet component).

**Where to work:** `prayers-app/components/DonationWidget/DonationWidget.tsx` (TODO), `prayers-app/constants/donations.ts` (מוסיפים קבוע סף). קורא מ-`DONATION_TIERS[currency]` (currency=ILS עד ספרינט 4).

**Steps:**
1. להוסיף ל-`constants/donations.ts` קבוע סף `PRAYER_NAME_MIN_AMOUNT` (per-currency, מקביל ל-`DONATION_TIERS`; ILS=7200). זה הסף שממנו ומעלה ייפתח שדה "שם לתפילה" (משמש ב-F4).
2. לולאה על `DONATION_TIERS['ILS']` → כפתור לכל tier; נבחר = styled אחרת.
3. כפתור "אחר" → `TextInput` → `setCustomAmount`.
4. כפתור "תרום" פותח את ה-bottom sheet.

**Pitfalls:** סכומים והסף מ-constants, לא ערכי קסם קשיחים. מחרוזות דרך `t('key')`. RTL.

**Proof of done:** צילום מסך; כפתורי ₪18/₪36/₪72/₪180/₪360/אחר; highlight בלחיצה.

**Effort:** M
**Dependencies:** none
**Out of scope:** תשלום (F4), מטבע דינמי (ספרינט 4).
**Acceptance criteria:**
- [ ] כפתורי הסכום מוצגים ומסומנים בלחיצה
- [ ] "תרום" פותח bottom sheet
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F4 — DonationBottomSheet + Stripe Payment Sheet + הצלחה

**Goal:** הגיליון התחתון אוסף **שם תורם** (חובה, לקבלה), ומסף `PRAYER_NAME_MIN_AMOUNT` ומעלה גם **שם לתפילה** (אופציונלי, שדה נפרד), פותח את Stripe Payment Sheet, מאשר את התרומה מול השרת, ומציג אנימציית הצלחה. זו פרוסת התשלום המלאה מקצה לקצה, וכאן מוטמע מודל התרומות.

**Context:** צורך את F1 (initiate/confirm) ואת קבוע הסף מ-F3. מחבר `services/stripe.ts` + `hooks/useDonation.ts` + רכיבי הגיליון. נקודת ה-Sync `DonationResponse`. מפתחות i18n חדשים: `donation.donor_name` (שם תורם לקבלה) ו-`donation.prayer_name` (שם לתפילה) ב-`he.json`.

**Where to work:** `prayers-app/services/stripe.ts` (`openPaymentSheet` skeleton), `prayers-app/hooks/useDonation.ts` (TODO), `prayers-app/components/DonationWidget/DonationBottomSheet.tsx` (TODO), `SuccessAnimation.tsx` (TODO), `prayers-app/i18n/he.json` (שני מפתחות).

**Steps:**
1. להוסיף ל-`he.json` את `donation.donor_name` ו-`donation.prayer_name`.
2. `openPaymentSheet(clientSecret)` — `initPaymentSheet` + `presentPaymentSheet`, מחזיר bool.
3. `DonationBottomSheet` — `TextInput` לשם תורם (required). אם `selectFinalAmount(store) >= PRAYER_NAME_MIN_AMOUNT[currency]` → להציג `TextInput` שני "שם לתפילה" (optional). כפתור "אשר תרומה של ₪72", spinner ב-`isProcessing`, `SuccessAnimation` ב-success.
4. `useDonation().initiateDonation(prayerId)` — `POST /initiate` עם `donor_name` ו-`prayer_name` → `openPaymentSheet` → `POST /confirm` → `donationStore` success/error.
5. `SuccessAnimation` — checkmark + "תפילתך נשלחה ✨" (Animated API).

**Pitfalls:** סכום באגורות. שם תורם חובה תמיד; שם לתפילה מופיע רק מהסף ומעלה (נקרא מ-`PRAYER_NAME_MIN_AMOUNT`, לא ערך קשיח). טיפול בביטול Payment Sheet (חוזר בלי שגיאה). מחרוזות דרך `t`.

**Proof of done:** וידאו/צילום: בחירת ₪72 → שם תורם → מופיע שדה "שם לתפילה" → אישור → Stripe → כרטיס טסט `4242...` → אנימציית הצלחה → DB עם `status="success"`, `amount=7200`, `donor_name`, `prayer_name`. ובחירת ₪18 (מתחת לסף) → שדה "שם לתפילה" לא מופיע.

**Effort:** L
**Dependencies:** F1, F3
**Out of scope:** כרטיס שמור (ספרינט 3).
**Acceptance criteria:**
- [ ] תרומה מקצה לקצה עם כרטיס טסט מצליחה ונשמרת `success` עם `donor_name` ו-`prayer_name`
- [ ] שדה "שם לתפילה" מופיע מהסף ומעלה בלבד
- [ ] אנימציית הצלחה מוצגת; ביטול לא קורס
- [ ] צילום מסך לפני/אחרי (כולל מעל ומתחת לסף) ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — עלייה לענן (staging)

#### F5 — Deploy ה-backend ל-Render

**Goal:** להעלות את ה-backend עם PostgreSQL מנוהל ל-Render, כך שיש URL ציבורי וסביבת staging חיה שממנה ממשיכים לעבוד.

**Context:** מקדים את ה-deploy כדי שלא הכל ייצבר לספרינט 5. נקודת Sync של משתני סביבה. דורש עדכון CORS ב-`backend/app/core/config.py`. חוסם את F6 (Vercel צריך URL של ה-API).

**Where to work:** Render dashboard, `backend/app/core/config.py` (cors_origins), `.env.example` (סנכרון שמות המשתנים).

**Steps:**
1. ב-Render: managed Postgres + Web Service `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
2. משתני סביבה ב-Render (DATABASE_URL, STRIPE_*, FIREBASE_*, ALLOWED_ORIGINS).
3. הרצת `alembic upgrade head` ו-`seed.py` פעם אחת על ה-DB המנוהל.

**Pitfalls:** סודות רק ב-Render env, לא ב-git. `.env.example` מתעדכן עם שמות המפתחות (Sync).

**Proof of done:** `https://<app>.onrender.com/health` → 200; `/api/prayers` מחזיר 5.

**Effort:** M
**Dependencies:** F1 (כדי שיהיה גם נתיב תרומות חי), אך אפשר להתחיל מול ספרינט 1 בלבד
**Out of scope:** רישום webhook פרודקשן סופי + rate limiting (ספרינט 5), SSR מלא (ספרינט 5).
**Acceptance criteria:**
- [ ] `/health` ו-`/api/prayers` עובדים מ-URL ציבורי ב-Render
- [ ] מיגרציות + seed רצו על ה-DB המנוהל; סודות לא ב-git; `.env.example` מעודכן (Sync)
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F6 — Deploy ה-web ל-Vercel

**Goal:** להעלות את אפליקציית ה-web ל-Vercel ולחבר ל-backend ב-Render, כדי שיש אתר חי לבדיקה.

**Context:** צורך את F5 (URL של ה-API). `EXPO_PUBLIC_API_URL` מצביע על Render.

**Where to work:** Vercel project, משתני `EXPO_PUBLIC_*`, build command של Expo web.

**Steps:**
1. Import repo → build `npx expo export --platform web`.
2. משתני סביבה: כל `EXPO_PUBLIC_*`, כש-`EXPO_PUBLIC_API_URL` מצביע על Render.
3. בדיקת תרומת טסט מקצה לקצה בסביבה החיה.

**Pitfalls:** מפתחות ציבוריים בלבד ב-`EXPO_PUBLIC_*`. CORS ב-backend חייב לכלול את כתובת Vercel.

**Proof of done:** `https://<app>.vercel.app` מציג תפילות מה-backend החי; תרומת טסט עוברת.

**Effort:** M
**Dependencies:** F5
**Out of scope:** SSR מלא ל-SEO (ספרינט 5), EAS מובייל (ספרינט 5).
**Acceptance criteria:**
- [ ] האתר עולה ומציג תפילות מה-backend החי
- [ ] תרומת טסט מקצה לקצה עובדת בסביבה החיה
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### מאגר משימות — ספרינט 2

| משימה | פיצ'ר | Effort | תלויות | סטטוס |
|---|---|---|---|---|
| F1 🚨 | Payment Intent | L | none | available |
| F2 | Webhook | M | F1 | available |
| F3 | DonationWidget | M | none | available |
| F4 | Payment Sheet + הצלחה | L | F1, F3 | available |
| F5 | Deploy Render | M | F1 | available |
| F6 | Deploy Vercel | M | F5 | available |

### קומפוננטות ו-hooks זמינים בסיום ספרינט 2

כל מה שהיה בסיום ספרינט 1, ועוד:

| קומפוננטה / hook | ייבוא | סטטוס | מקור |
|---|---|---|---|
| `DonationWidget` | `@/components/DonationWidget` | מלאה: בחירת סכום, "אחר", פותח גיליון | עדכון ספרינט 2 |
| `DonationBottomSheet` | `@/components/DonationWidget` | מלא: donor_name + prayer_name + Payment Sheet | ספרינט 2 |
| `SuccessAnimation` | `@/components/DonationWidget` | מלאה | ספרינט 2 |
| `useDonation()` | `@/hooks/useDonation` | מלא: initiate → confirm → success/error | ספרינט 2 |

---
---

# ספרינט 3 — שבועות 5-6 | Auth + כרטיס שמור + Quick Buttons

> **מטרה:** משתמשת מתחברת עם Google, שומרת כרטיס, ותורמת ב-2 קליקים דרך Quick Button. בסוף: "יש לי מבחן" → אישור → תרומה עם כרטיס שמור.

נקודת Sync: `UserResponse` (`has_saved_card`, `saved_card_last4`, `saved_card_brand`).

---

### Feature — Firebase Auth (Backend)

#### F1 🚨 BLOCKER — Firebase Auth Middleware + get_or_create_user

**Goal:** לאמת Firebase token בשרת ולמפות אותו ל-User ב-DB. חוסם את כל ה-endpoints המוגנים.

**Context:** חוסמת את כרטיס שמור (F2), Quick Donate (F3), והפלואו בלקוח (F4-F6). מימוש `verify_firebase_token` (מחזיר User), `optional_firebase_token` (מחזיר None ללא header).

**Where to work:** `backend/app/main.py` (init firebase-admin), `backend/app/middleware/auth.py` (מחזיר 501 כרגע), `backend/app/services/user_service.py` (TODO).

**Steps:**
1. ב-`main.py`: `firebase_admin.initialize_app` עם credentials מ-env.
2. `verify_firebase_token` — חילוץ Bearer, `verify_id_token`, `get_or_create_user`, החזרת User.
3. `optional_firebase_token` — None אם אין header.
4. `get_or_create_user(db, uid, email, name)` + `get_user_by_uid`.

**Pitfalls:** credentials מ-env, לא קובץ ב-git. מסלול כושל (טוקן פג → 401).

**Proof of done:** `/initiate` עם Bearer עובד; בלי header עובד (anonymous); `/quick` בלי header → 401; user נוצר ב-DB.

**Effort:** L
**Dependencies:** none
**Out of scope:** UI התחברות (F4).
**Acceptance criteria:**
- [ ] endpoint מוגן עובד עם token ונכשל בלי
- [ ] user נוצר ב-DB בלוגין ראשון
- [ ] credentials מ-env
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F2 — שמירת כרטיס ב-Stripe + ניהול /users/me

**Goal:** בעת תרומה עם "שמור כרטיס" — ליצור Stripe Customer, לצרף payment method, ולשמור על ה-User `last4`/`brand`/`has_saved_card`. כולל `GET/PATCH /users/me` ו-`DELETE /card`.

**Context:** צורך את F1. נקודת Sync `UserResponse`. נדרש לפני F5 (גיליון מזהה כרטיס).

**Where to work:** `backend/app/services/stripe_service.py` (`create_or_get_customer`, `attach_payment_method`, `detach_payment_method`), `donation_service.confirm_donation` (עדכון לתמיכה ב-`save_card`), `backend/app/routers/users.py` (TODO).

**Steps:**
1. `create_or_get_customer`, `attach_payment_method`, `detach_payment_method`.
2. `confirm_donation(..., save_card, uid)` — בשמירה: יצירת customer, שליפת pm, attach, UPDATE User.
3. `GET /users/me` → `UserResponse`; `PATCH` → עדכון העדפות; `DELETE /card` → detach + ניקוי.

**Pitfalls:** לא שומרים מספר כרטיס מלא — רק `last4`/`brand` (PCI). שמות שדות `UserResponse` תואמים ללקוח (Sync).

**Proof of done:** תרומה + "שמור" → `/users/me` מחזיר `has_saved_card:true, last4:"4242"`; `DELETE /card` → `false`.

**Effort:** L
**Dependencies:** F1
**Out of scope:** Quick Donate (F3).
**Acceptance criteria:**
- [ ] שמירת כרטיס מעדכנת את ה-User; מחיקה מנקה
- [ ] רק `last4`/`brand` נשמרים
- [ ] `UserResponse` סוכם מול הלקוח (Sync)
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F3 — Quick Donate (חיוב כרטיס שמור)

**Goal:** endpoint שמחייב מיד את הכרטיס השמור של המשתמש, לתרומת 2-קליקים.

**Context:** צורך את F1+F2. צד השרת של F6 (Quick Buttons).

**Where to work:** `stripe_service.charge_saved_card`, `donation_service.quick_donation`, `routers/donations.py` (`quick_donate`).

**Steps:**
1. `charge_saved_card(customer_id, amount, currency)` — `PaymentIntent.create` עם `confirm=True, off_session=True`.
2. `quick_donation` — בדיקת `has_saved_card` (אחרת 400), חיוב, INSERT Donation `success`.
3. `POST /quick` → `Depends(verify_firebase_token)`.

**Pitfalls:** דורש auth. סכום באגורות. בלי כרטיס → 400 ברור.

**Proof of done:** משתמש עם כרטיס → `/quick` → 200 ותרומה נשמרת; בלי → 400.

**Effort:** M
**Dependencies:** F1, F2
**Out of scope:** UI (F6).
**Acceptance criteria:**
- [ ] `/quick` מחייב כרטיס שמור ושומר תרומה
- [ ] בלי כרטיס → 400
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — Auth + Quick Buttons (Frontend)

#### F4 — Firebase Auth Flow + מסך התחברות

**Goal:** פלואו התחברות מלא: אנונימי שקט בפתיחה, התחברות Google (ו-Apple ב-iOS), קישור ההיסטוריה האנונימית, וסנכרון ה-user ל-store עם פרטי הכרטיס.

**Context:** צורך את F1+F2 (`/users/me`). משתמש ב-`authStore` (דוגמת ייחוס).

**Where to work:** `prayers-app/hooks/useAuth.ts` (TODO), `prayers-app/app/auth/login.tsx` (TODO), `prayers-app/app/_layout.tsx` (קריאה ל-`useAuth`).

**Steps:**
1. `useAuth` — `onAuthStateChanged` → set user/token → `GET /users/me` → עדכון store.
2. `login.tsx` — Google sign-in, `linkWithCredential` אם היה anonymous; Apple רק ב-iOS.
3. signOut → reset + ניווט.

**Pitfalls:** מסלול כושל (ביטול Google). token מ-Firebase. רשת דרך `api.ts`.

**Proof of done:** צילום מסך; פתיחה → אנונימי שקט; Google → `authStore.user` מלא; `/users/me` עובד.

**Effort:** L
**Dependencies:** F1, F2
**Out of scope:** מסך פרופיל (ספרינט 4).
**Acceptance criteria:**
- [ ] אנונימי שקט בפתיחה; Google login עובד וממלא store
- [ ] מסלול ביטול לא קורס
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F5 — Bottom Sheet מזהה כרטיס שמור

**Goal:** אם יש כרטיס שמור — הגיליון מציג "VISA ****4242" וכפתור אישור יחיד (Quick Donate); אחרת Stripe Payment Sheet + checkbox "שמור כרטיס".

**Context:** צורך את F2/F3 (server) ו-F4 (auth ב-store). עדכון לרכיב מספרינט 2.

**Where to work:** `prayers-app/components/DonationWidget/DonationBottomSheet.tsx` (עדכון), `prayers-app/hooks/useDonation.ts` (`quickDonate`).

**Steps:**
1. לקרוא `hasSavedCard`/`last4`/`brand` מ-`authStore`.
2. עם כרטיס → תצוגת כרטיס + כפתור יחיד → `quickDonate`.
3. בלי → Payment Sheet + checkbox `save_card`.
4. `quickDonate` — `POST /quick` עם token → success.

**Pitfalls:** RTL. מחרוזות דרך `t`. סכום באגורות.

**Proof of done:** צילום מסך; משתמש עם כרטיס → "VISA ****4242" + כפתור אחד → 2 שניות → הצלחה.

**Effort:** M
**Dependencies:** F3, F4
**Out of scope:** Quick Buttons (F6).
**Acceptance criteria:**
- [ ] עם כרטיס: גיליון מקוצר + Quick Donate; בלי: Payment Sheet + checkbox
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F6 — Quick Buttons פועלים

**Goal:** מסך הבית מציג 5 כפתורי אירוע מהיר; לחיצה פותחת גיליון עם הסכום הדיפולטי והכרטיס השמור, ומבצעת תרומה.

**Context:** צורך את F3+F5. משתמש ב-`QUICK_BUTTONS` (constant מלא).

**Where to work:** `prayers-app/components/QuickButtons/QuickButtons.tsx` (TODO).

**Steps:**
1. רנדור `QUICK_BUTTONS` — emoji + `label[lang]`.
2. לחיצה → גיליון עם שם, `default_amount[currency]`, כרטיס שמור.
3. "שלח תפילה + תרום" → `quickDonate(button.prayer_slug, button.slug)`.

**Pitfalls:** label/סכום מ-constant. מחרוזות דרך `t`. RTL.

**Proof of done:** צילום מסך; 5 כפתורים; "יש לי מבחן" → גיליון ₪72 + כרטיס → הצלחה.

**Effort:** M
**Dependencies:** F3, F5
**Out of scope:** מטבע דינמי (ספרינט 4).
**Acceptance criteria:**
- [ ] 5 כפתורים מוצגים; לחיצה מבצעת תרומה
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### מאגר משימות — ספרינט 3

| משימה | פיצ'ר | Effort | תלויות | סטטוס |
|---|---|---|---|---|
| F1 🚨 | Auth Middleware | L | none | available |
| F2 | כרטיס שמור + /users/me | L | F1 | available |
| F3 | Quick Donate | M | F1, F2 | available |
| F4 | Auth Flow + login | L | F1, F2 | available |
| F5 | גיליון מזהה כרטיס | M | F3, F4 | available |
| F6 | Quick Buttons | M | F3, F5 | available |

### קומפוננטות ו-hooks זמינים בסיום ספרינט 3

כל מה שהיה בסיום ספרינט 2, ועוד:

| קומפוננטה / hook | ייבוא | סטטוס | מקור |
|---|---|---|---|
| `DonationBottomSheet` | `@/components/DonationWidget` | עדכון: תצוגת כרטיס שמור (last4 + brand) | עדכון ספרינט 3 |
| `QuickButtons` | `@/components/QuickButtons` | מלאה: emoji + label[lang] + quick donate | ספרינט 3 |
| `authStore` (עדכון) | `@/store/authStore` | מלא: user + hasSavedCard + last4 + brand | עדכון ספרינט 3 |

---
---

# ספרינט 4 — שבועות 7-8 | פרופיל + רב-לשוני + SEO + מטבע

> **מטרה:** פרופיל עם היסטוריה, 6 שפות עם RTL, מטבע לפי מיקום, ו-SEO מלא. חיפוש ובאנר הורדה הוזזו לספרינט 5 כדי לאזן את העומס.

נקודת Sync: פרמטר `?lang=` ופורמט תוצאות החיפוש (לקראת החיפוש בספרינט 5).

---

### Feature — היסטוריה ורב-לשוניות (Backend)

#### F1 — היסטוריית תרומות

**Goal:** endpoint שמחזיר את 20 התרומות האחרונות של המשתמש.

**Context:** צד השרת של מסך הפרופיל (F3).

**Where to work:** `donation_service.list_history`, `routers/donations.py` (`donation_history`).

**Steps:** SELECT WHERE user_id ORDER BY created_at DESC LIMIT 20, עם slug/title התפילה; `GET /history` עם auth.

**Effort:** M
**Dependencies:** none
**Out of scope:** UI (F3).
**Acceptance criteria:**
- [ ] `/history` מחזיר 20 אחרונות ממוין; מוגן ב-auth
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F2 — Seed רב-לשוני + חיפוש רב-לשוני

**Goal:** להוסיף שדות אנגלית ל-5 התפילות ולהרחיב את החיפוש לשפה.

**Context:** מאפשר `?lang=en`. נקודת Sync `?lang=`.

**Where to work:** `backend/scripts/seed.py` (עדכון: `title_en`/`body_en`/`seo_*_en`), `prayer_service.search_prayers` (כולל seo_keywords + fallback).

**Steps:** הוספת שדות EN ל-seed; הרחבת ILIKE; fallback ל-he.

**Pitfalls:** שינוי seed לא דורש מיגרציה (העמודות קיימות). idempotent.

**Effort:** M
**Dependencies:** none
**Out of scope:** תרגום ל-fr/ru/es/ar (תוכן עתידי).
**Acceptance criteria:**
- [ ] `?lang=en` מחזיר 5 תפילות באנגלית; חיפוש EN עובד
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — פרופיל, שפה, מטבע, SEO, חיפוש, באנר (Frontend)

#### F3 — מסך פרופיל

**Goal:** פרופיל עם פרטי משתמש, ניהול כרטיס שמור, היסטוריית תרומות, והתנתקות; מצב לא-מחובר עם הזמנה להתחבר.

**Context:** צורך את F1 ואת auth מספרינט 3.

**Where to work:** `prayers-app/app/(tabs)/profile.tsx` (TODO).

**Steps:** מצב לא-מחובר (כפתור Google); מחובר: פרטים, כרטיס + מחיקה (Alert → `DELETE /card`), היסטוריה (`FlatList` עם empty state), התנתקות.

**Effort:** L
**Dependencies:** F1
**Out of scope:** —
**Acceptance criteria:**
- [ ] פרופיל מציג פרטים/כרטיס/היסטוריה; מחיקה והתנתקות עובדות
- [ ] empty/loading states; מחרוזות דרך `t`
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F4 — Language Picker + RTL/LTR + השלמת קבצי i18n

**Goal:** בורר 6 שפות שמחליף UI מיד, כולל היפוך RTL לערבית/עברית, והשלמת קבצי התרגום.

**Context:** משתמש ב-`languageStore`, `utils/detectLanguage`, `utils/rtl`. `he.json` מקור האמת למפתחות.

**Where to work:** `store/languageStore.ts`, `hooks/useLanguage.ts`, `components/LanguagePicker/LanguagePicker.tsx`, `app/_layout.tsx` (`I18nManager.forceRTL`), `i18n/{en,fr,ru,es,ar}.json`.

**Steps:** מילוי store/hook; Picker עם 6 שפות → `changeLanguage`; forceRTL לפי isRTL; השלמת כל קבצי ה-JSON עם מפתחות זהים ל-he.

**Pitfalls:** כל שפה חייבת בדיוק את מפתחות `he.json`. RTL דרך `utils/rtl`, לא שמאל/ימין קשיח.

**Effort:** L
**Dependencies:** none
**Out of scope:** SEO רב-לשוני (F6).
**Acceptance criteria:**
- [ ] בחירת FR מחליפה UI מיד; ערבית הופכת RTL; הבחירה נשמרת
- [ ] צילום מסך לפני/אחרי (כולל RTL) ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F5 — זיהוי מטבע לפי Geo-IP

**Goal:** זיהוי מטבע לפי מיקום (ipapi.co) והצגת הסכומים הנכונים ב-widget.

**Context:** צורך את `languageStore.currency` ו-`DONATION_TIERS`.

**Where to work:** `hooks/useCurrency.ts`, `utils/detectCurrency.ts` (קיים), `DonationWidget.tsx` (עדכון).

**Steps:** בדיקת AsyncStorage → detectCurrency → setCurrency (fallback ILS); ה-widget קורא tiers לפי currency.

**Effort:** M
**Dependencies:** F4
**Out of scope:** —
**Acceptance criteria:**
- [ ] VPN ארה"ב → $; ישראל → ₪; אירופה → €
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F6 — SEO מלא + עמוד תפילה רב-לשוני

**Goal:** `generateMetadata` (title/description/keywords/hreflang/canonical/OG) + JSON-LD, ועמוד `[lang]/prayer/[slug]` ששולח `?lang=`.

**Context:** SEO הוא לב המוצר. צורך את F2 (תוכן רב-לשוני). נקודת Sync `?lang=`.

**Where to work:** `app/prayer/[slug].tsx` (SEO), `app/[lang]/prayer/[slug].tsx` (TODO).

**Steps:** מימוש `generateMetadata`; JSON-LD Article; עמוד lang מקבל param ושולח ל-API; meta לפי שפה.

**Pitfalls:** hreflang לכל 6 השפות; canonical יחיד.

**Effort:** L
**Dependencies:** F2
**Out of scope:** Deploy SSR (ספרינט 5).
**Acceptance criteria:**
- [ ] `view-source` על `/prayer/health` מציג title/description/hreflang×6/JSON-LD
- [ ] `/en/prayer/health` ב-HTML אנגלית
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### מאגר משימות — ספרינט 4

| משימה | פיצ'ר | Effort | תלויות | סטטוס |
|---|---|---|---|---|
| F1 | היסטוריה | M | none | available |
| F2 | seed+חיפוש EN | M | none | available |
| F3 | מסך פרופיל | L | F1 | available |
| F4 | שפה + RTL | L | none | available |
| F5 | מטבע Geo-IP | M | F4 | available |
| F6 | SEO רב-לשוני | L | F2 | available |

> מסך חיפוש ובאנר הורדה הוזזו לספרינט 5 (היו F7/F8 כאן). ספרינט 4 כעת 6 פיצ'רים, מאוזן יותר.
> 💡 המלצה: לפתוח חשבונות App Store / Google Play כבר עכשיו, כדי שאישורי החנויות לא יעכבו את ספרינט 5.

### קומפוננטות ו-hooks זמינים בסיום ספרינט 4

כל מה שהיה בסיום ספרינט 3, ועוד:

| קומפוננטה / hook | ייבוא | סטטוס | מקור |
|---|---|---|---|
| `LanguagePicker` | `@/components/LanguagePicker` | מלאה: 6 שפות + RTL toggle | ספרינט 4 |
| `useLanguage()` | `@/hooks/useLanguage` | מלא: lang + isRTL + changeLanguage | ספרינט 4 |
| `languageStore` | `@/store/languageStore` | מלא: lang, isRTL, currency | ספרינט 4 |

---
---

# ספרינט 5 — שבועות 9-10 | Mobile + חיפוש + באנר + פולישינג + הקשחה

> **מטרה:** להפוך את סביבת ה-staging מספרינט 2 לפרודקשן מוקשח (SSR מלא, rate limiting, webhook פרודקשן), אפליקציה ב-EAS לטסטרים, מסך חיפוש ובאנר הורדה (שהוזזו מספרינט 4), טיפול שגיאות מלא, ופוליש.

> ה-deploy הבסיסי כבר בוצע בספרינט 2 (Render + Vercel staging). כאן מקשיחים אותו לפרודקשן ומוסיפים SSR + מובייל.

נקודת Sync: רשימת משתני סביבה ב-`.env.example`.

---

### Feature — Deploy Backend

#### F1 🚨 BLOCKER — הקשחת ה-backend לפרודקשן

**Goal:** לקחת את ה-backend שכבר חי ב-Render (ספרינט 2) ולהקשיח אותו לפרודקשן: webhook פרודקשן ב-Stripe, הפרדת מפתחות live/test, ו-CORS סגור רק לכתובות הפרודקשן.

**Context:** ה-deploy הבסיסי כבר קיים מספרינט 2 — כאן רק מקשיחים. חוסם את בדיקות ה-EAS (F4) מול שרת פרודקשן ואת ה-webhook החי.

**Where to work:** Render dashboard, `backend/app/core/config.py` (cors_origins לפרודקשן), Stripe Dashboard (webhook endpoint פרודקשן + מפתחות live).

**Steps:** רישום Stripe webhook לכתובת הפרודקשן עם events `payment_intent.succeeded`/`payment_intent.payment_failed`; החלפת מפתחות test ב-live; סגירת CORS לכתובות Vercel בלבד.

**Effort:** M
**Dependencies:** ספרינט 2 F5
**Out of scope:** SSR (F3), rate limiting (F2).
**Acceptance criteria:**
- [ ] webhook פרודקשן מעדכן תרומה ב-prod DB; מפתחות live פעילים
- [ ] CORS סגור לכתובות הפרודקשן; `.env.example` מעודכן (Sync)
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F2 — Rate Limiting מלא

**Goal:** הגבלת קצב: GET 100/min, POST donations 10/min, webhooks ללא הגבלה.

**Where to work:** `backend/app/middleware/rate_limit.py` (TODO, slowapi).

**Effort:** M
**Dependencies:** none
**Out of scope:** —
**Acceptance criteria:**
- [ ] מעל 10 תרומות/דקה מאותו IP → 429
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — Deploy Frontend + Mobile

#### F3 — הפעלת SSR על ה-Vercel הקיים

**Goal:** לקחת את ה-web שכבר חי ב-Vercel (ספרינט 2) ולעבור למצב SSR, כך ש-view-source מציג HTML מלא (קריטי ל-SEO שנבנה בספרינט 4).

**Context:** ה-deploy עצמו כבר קיים מספרינט 2 — כאן רק מחליפים את מצב ה-output ל-server ומחברים ל-API הפרודקשן.

**Where to work:** `prayers-app/app.json` (`web.output: "server"`), Vercel config + env (`EXPO_PUBLIC_API_URL` לפרודקשן).

**Effort:** M
**Dependencies:** F1
**Out of scope:** —
**Acceptance criteria:**
- [ ] `view-source` על `/prayer/health` מציג HTML מלא (SSR), לא JS בלבד
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F4 — EAS Build — iOS + Android

**Goal:** build לאפליקציה ב-EAS והגשה ל-Internal Testing בשתי החנויות.

**Where to work:** `prayers-app/app.json` (bundle ids), `prayers-app/eas.json`.

**Effort:** L
**Dependencies:** F1
**Out of scope:** פרסום ציבורי בחנות.
**Acceptance criteria:**
- [ ] tester פנימי מתקין; האפליקציה עובדת על מכשיר אמיתי iOS+Android
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — איכות ו-UX (משותף)

#### F5 — Error States + Loading States

**Goal:** טיפול אחיד בשגיאות וטעינה בכל המסכים, כולל offline banner ו-401 → logout.

**Where to work:** כל מסך עם `isLoading`/`error`; `@react-native-community/netinfo`.

**Effort:** M
**Dependencies:** none
**Out of scope:** —
**Acceptance criteria:**
- [ ] כיבוי WiFi → banner "אין חיבור" → הדלקה → נעלם; אין קריסות בתרחישי שגיאה
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F6 — UX Polish

**Goal:** אנימציית הצלחה משופרת, haptics, KeyboardAvoiding, tab icons, splash/icon.

**Where to work:** `SuccessAnimation.tsx`, `expo-haptics`, `DonationBottomSheet`, tab layout, `assets/`, `app.json`.

**Effort:** M
**Dependencies:** none
**Out of scope:** —
**Acceptance criteria:**
- [ ] אנימציות + haptics; splash + tab icons מוצגים; אין קפיצות UI
- [ ] צילום מסך/וידאו לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### Feature — חיפוש ובאנר (הוזזו מספרינט 4)

#### F7 — מסך חיפוש

**Goal:** חיפוש עם debounce שמציג תוצאות בכרטיסים.

**Context:** צורך את חיפוש רב-לשוני מספרינט 4 (F2 שם).

**Where to work:** `app/(tabs)/search.tsx` (TODO).

**Steps:** `TextInput` עם debounce 300ms → `GET /search?q=&lang=` → `FlatList` של `PrayerCard`; empty + initial states.

**Effort:** M
**Dependencies:** ספרינט 4 F2
**Out of scope:** —
**Acceptance criteria:**
- [ ] "רפא" אחרי 300ms → תוצאות; "healing" → תוצאות
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

#### F8 — App Download Banner

**Goal:** באנר הורדה ב-web בלבד, מותאם ל-iOS/Android/Desktop, עם סגירה זכורה.

**Context:** מוצג ב-`Platform.OS === 'web'`.

**Where to work:** `components/AppDownloadBanner/AppDownloadBanner.tsx` (TODO).

**Steps:** זיהוי userAgent → כפתור חנות מתאים / QR ב-Desktop; X → `DISMISSED_BANNER` ב-AsyncStorage.

**Effort:** M
**Dependencies:** none
**Out of scope:** —
**Acceptance criteria:**
- [ ] iPhone → לינק App Store; Android → Play; X מסתיר ולא חוזר
- [ ] צילום מסך לפני/אחרי ב-PR
- [ ] PR נבדק על ידי המפתחת השנייה ואושר על ידי שרה לפני מיזוג

---

### מאגר משימות — ספרינט 5

| משימה | פיצ'ר | Effort | תלויות | סטטוס |
|---|---|---|---|---|
| F1 🚨 | הקשחת backend לפרודקשן | M | ס2 F5 | available |
| F2 | Rate Limiting | M | none | available |
| F3 | Vercel SSR | M | F1 | available |
| F4 | EAS Build | L | F1 | available |
| F5 | Error/Loading | M | none | available |
| F6 | UX Polish | M | none | available |
| F7 | מסך חיפוש | M | ס4 F2 | available |
| F8 | באנר הורדה | M | none | available |

### קומפוננטות ו-hooks זמינים בסיום ספרינט 5 — Pool מלא לפרודקשן

כל מה שהיה בסיום ספרינט 4, ועוד:

| קומפוננטה / hook | ייבוא | סטטוס | מקור |
|---|---|---|---|
| `AppDownloadBanner` | `@/components/AppDownloadBanner` | מלאה: web בלבד, X → AsyncStorage | ספרינט 5 |
| `SearchScreen` | `@/app/search/index.tsx` | מלאה: חיפוש טקסט + תוצאות | ספרינט 5 |
| `ErrorState` / `EmptyState` | `@/components/common` | מלאה: כל המסכים מטופלים | ספרינט 5 |

---
---

# גרף תלויות (מסלולים קריטיים)

```
ספרינט 1:  F1 → F2 → F3 → F4 → {F6, F7}        (F5 במקביל מיום 1)
ספרינט 2:  F1 → {F2, F4};  F3 → F4;  F1 → F5 → F6 (deploy)
ספרינט 3:  F1 → {F2, F4};  F2 → F3;  {F3,F4} → F5 → F6
ספרינט 4:  F2 → F6;  F1 → F3;  F4 → F5
ספרינט 5:  ס2F5 → F1 → {F3, F4};  F2/F5/F6/F7/F8 עצמאיים
```

הבלוקרים (🚨) נלקחים ראשונים בכל ספרינט. תמיד יש עבודה לא-חסומה למפתחת השנייה (ספרינט 1: F5; ספרינט 2: F3; ספרינט 3: F4 אחרי F1; ספרינט 4/5: מספר משימות עצמאיות).

---

# נקודות Sync (ה-contract בכל ספרינט)

| Sprint | Contract לסכם לפני בנייה |
|---|---|
| 1 | `PrayerResponse` ↔ `types/prayer.types.ts` |
| 2 | `DonationResponse` (`client_secret`, `payment_intent_id`) |
| 3 | `UserResponse` (`has_saved_card`, `saved_card_last4`, `saved_card_brand`) |
| 4 | פרמטר `?lang=` + פורמט תוצאות חיפוש |
| 5 | משתני סביבה ב-`.env.example` |

---

# Risk Register + ביקורת פערים (spec ↔ code ↔ plan)

| יכולת ב-SPEC | קיים בקוד | מתוכנן | פער / טיפול |
|---|---|---|---|
| מודלים/schemas/constants/types | כן (מלא) | — | אין פער |
| Prayers API | TODO | ספרינט 1 F4 | מכוסה |
| מודל תרומות + "שם לתפילה" + סף | חלקי (אין עמודה/קבוע) | ספרינט 1 F2 + ספרינט 2 F4 | נסגר |
| תרומה + Stripe | TODO | ספרינט 2 | מכוסה |
| Deploy (backend+web) staging | אין | ספרינט 2 F5-F6 | נסגר (הוקדם) |
| Auth + כרטיס שמור + Quick | TODO | ספרינט 3 | מכוסה |
| פרופיל/i18n/SEO/מטבע | TODO | ספרינט 4 | מכוסה |
| חיפוש + באנר | TODO | ספרינט 5 F7-F8 | מכוסה (הוזז מ-4) |
| Mobile/SSR/הקשחה/פוליש | TODO | ספרינט 5 | מכוסה (תלות חיצונית) |
| תרומה חוזרת (RecurringDonation) | מודל קיים, service TODO | **לא מתוכנן באף ספרינט** | פער מוכר. מודל + endpoints קיימים כשלד אך אינם ב-SPEC כפיצ'ר ספרינט. המלצה: backlog / ספרינט עתידי. לא מתחייבים עכשיו. |
| תרגום תוכן תפילות ל-fr/ru/es/ar | עמודות קיימות, ריקות | חלקי (UI בלבד ב-4) | תוכן עתידי (לא קוד) — backlog תוכן |

### סיכונים מרכזיים

1. **ספרינט 4 אוזן** — חיפוש (F7) ובאנר (F8) הוזזו לספרינט 5 לפי החלטת שרה. ספרינט 4 כעת 6 פיצ'רים. **ספרינט 5 גדל ל-8 פיצ'רים** — לעקוב אחריו כסיכון הקיבולת החדש; חלק מהמשימות (F5/F6/F8) קלות וניתנות לדחיפה אם צריך.
2. **ספרינט 5 תלוי בגורמים חיצוניים** (אישורי App Store/Play, EAS). מומלץ לפתוח את חשבונות החנויות כבר בספרינט 4. הסיכון של ה-deploy עצמו ירד כי הוא בוצע כבר בספרינט 2.
3. **ספרינט 2 — deploy מוקדם.** F5/F6 (Render/Vercel) הם תלות חיצונית; כדאי להתחיל אותם מוקדם בספרינט ולא בסוף.
4. **ספרינט 1 — תלות פנימית גבוהה.** F5 חייב להתחיל ביום 1 כדי שהמפתחת השנייה לא תמתין לבלוקרים.
5. **RecurringDonation לא מתוכנן** — פער מוכר, לא נשמט בשקט; מופנה ל-backlog.

---

# Backlog (לא בספרינטים 1-5)

| פריט | תיוג | סיבה |
|---|---|---|
| תרומה חוזרת (Recurring) — service + UI | backlog | מודל קיים, לא ב-SPEC כפיצ'ר ספרינט |
| תרגום תוכן תפילות ל-fr/ru/es/ar | backlog (תוכן) | עבודת תוכן, לא קוד |
| Push Notifications, WhatsApp share, Admin CMS | backlog | "נחמד שיהיה" באפיון, מעבר ל-MVP |

</div>
