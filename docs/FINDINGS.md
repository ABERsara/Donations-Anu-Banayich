<div dir="rtl">

# FINDINGS — ממצאי בדיקת קוד

**עדכון אחרון:** 2026-08-13  

---

## הנחיות עבודה עם המסמך

- לפני שמוסיפות ממצא — ודאי שראית את הקוד. **אל תסמנו ממצא ללא path:שורה מדויק.**
- `תאריך` = תאריך גילוי. `טיקט` = ABD-XXX אם קיים, אחרת `—`.
- `פתוח` = טרם נפתר. `תוקן` = merged ל-main. `בענף` = תוקן בברנץ', לא מוזג.

### ⚠️ אזהרה — הימנעי מ-false negative

לפני שמסמנות "תוקן", בדקי שהברנץ' אכן נמזג ל-`main`. ברנץ' פתוח ≠ תיקון.

---

## מקרא סוג

| קוד | משמעות |
|---|---|
| `בעיה` | קוד שובר תוצאה — יחזיר שגיאה / undefined בפועל |
| `חסר` | שדה / פונקציה שצריכה להיות ואינה |
| `לא-תואם` | אי-תאימות front↔back (שם שדה, טיפוס, מבנה JSON) |
| `stub` | פונקציה שמוגדרת אך מחזירה 501 / NotImplementedError |

## מקרא חומרה

| ערך | משמעות |
|---|---|
| 🔴 קריטי | תוצאה שבורה — flow ראשי לא יעבוד |
| 🟠 גבוה | תוצאה חלקית / אי-תאימות שתשבור Sprint הבא |

## מקרא סטטוס

| ערך | משמעות |
|---|---|
| `פתוח` | לא תוקן, יש טיקט |
| `בענף` | תוקן בברנץ' — **טרם מוזג ל-main** |
| `תוקן` | merged ל-main |

---

## ⚠️ התראת Merge — ABD-59

PR #12 (ABD-59) מוזג ל-main אך **איבד שינויים קריטיים** — `auth.py` ו-`UserResponse` בקוד הנוכחי הם גרסת ה-scaffold, לא הגרסה המתוקנת מהברנץ'. יש לבדוק ולהחיל מחדש את השינויים האבודים.

---

## S-1 | Backend — schemas.py

**קבצים עיקריים:** `backend/app/schemas/schemas.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S1-01 | `schemas.py:32` | לא-תואם | `DonationResponse` מחזיר `client_secret` / `payment_intent_id` (snake_case). הלקוח מצפה ל-`clientSecret` / `paymentIntentId` (ראי `InitiateDonationResponse` ב-`donation.types.ts:60`). חסרים `Field(alias=...)` + `by_alias=True`. ללא תיקון — `response.clientSecret` יחזיר `undefined` על כל Payment Sheet. | 🔴 קריטי | 2026-08-13 | ABD-67 | פתוח |
| S1-02 | `schemas.py:50` | לא-תואם | `RecurringDonationResponse` בלי aliases. שדות `stripe_subscription_id`, `is_active`, `next_charge_at` יוחזרו snake_case; frontend מצפה ל-`stripeSubscriptionId`, `isActive`, `nextChargeAt`. | 🟠 גבוה | 2026-08-13 | ABD-68 | פתוח |
| S1-03 | `schemas.py:20` | לא-תואם | `DonationCreate` מצפה snake_case (`prayer_id`, `donor_name`, `save_card`, `quick_button_slug`) אך frontend שולח camelCase (`prayerId`, `donorName`, `saveCard`, `quickButtonSlug`). אין `alias_generator`. כל `POST /api/donations/initiate` יחזיר **422** — תרומה לא תעבור. | 🔴 קריטי | 2026-08-13 | — | פתוח |
| S1-04 | `schemas.py:77` | לא-תואם | `UserResponse` בלי aliases ובלי `by_alias=True`. כל שדות המשתמש (`firebase_uid`, `display_name`, `has_saved_card` וכו') יוחזרו snake_case; frontend מצפה camelCase. **⚠️ אבד ב-merge ABD-59** — תוקן בברנץ' אך לא מוזג. | 🟠 גבוה | 2026-08-13 | ABD-59 | פתוח |
| S1-05 | `schemas.py:77` | חסר | `UserResponse` חסר שדות `is_anonymous` ו-`created_at`. `selectIsLoggedIn` ב-`authStore.ts:25` בודק `!s.user.isAnonymous` — כאשר חסר, `undefined` → `true` → משתמש אנונימי נראה כמחובר. פגם אבטחה. | 🟠 גבוה | 2026-08-13 | — | פתוח |
| S1-06 | `schemas.py:91` | לא-תואם | `UserUpdate` חסר aliases (frontend שולח `preferredLang`, `preferredCurrency` camelCase) וחסר שדה `display_name` לחלוטין — frontend שולח `displayName` שנופל לחלל. PATCH לא יעדכן שום דבר. | 🟠 גבוה | 2026-08-13 | — | פתוח |

---

## S-2 | Frontend — stripe.ts

**קבצים עיקריים:** `prayers-app/services/stripe.ts`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S2-01 | `stripe.ts:17` | בעיה | `openPaymentSheet` קוראת ל-`presentPaymentSheet()` מבלי לקרוא קודם ל-`initPaymentSheet(...)`. ב-runtime — Payment Sheet קורסת בשקט. תוקן בברנץ' ABD-14 (לא מוזג). | 🔴 קריטי | 2026-08-13 | ABD-14 | בענף |

---

## S-3 | Backend — stripe_service.py

**קבצים עיקריים:** `backend/app/services/stripe_service.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S3-01 | `stripe_service.py:35` | stub | `charge_saved_card` — `raise NotImplementedError`. חוסמת Quick Donate. תוקן בברנץ' ABD-61, לא מוזג. | 🟠 גבוה | 2026-08-13 | ABD-61 | בענף |

---

## S-4 | Backend — auth.py

**קבצים עיקריים:** `backend/app/middleware/auth.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S4-01 | `auth.py:28` | stub | `verify_firebase_token` תמיד מזרה 501. כל endpoint עם `Depends(verify_firebase_token)` (quick, recurring, history, cancel-recurring, users/me) שבור לחלוטין. **⚠️ אבד ב-merge ABD-59** — הברנץ' תיקן את הקובץ, ה-merge השמיט אותו. | 🔴 קריטי | 2026-08-13 | ABD-59 | פתוח |

---

## S-5 | Backend — donations.py

**קבצים עיקריים:** `backend/app/routers/donations.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S5-01 | `donations.py:68` | stub | `donation_history` מחזיר `[]` ריק בשקט (לא `NotImplementedError`) — מפתח לא יידע שהשירות לא מומש. כמו כן הוגדר כ-`def` (sync) בעוד `donation_service.list_history` הוא `async def` — כשיתממש, יגרום לשגיאת runtime. | 🟠 גבוה | 2026-08-13 | — | פתוח |

---

## S-6 | Backend — donation_service.py

**קבצים עיקריים:** `backend/app/services/donation_service.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S6-01 | `donation_service.py:33` | בעיה | `customer_id=None` קשיח — גם כאשר `data.save_card=True` ויש `user_uid`, ה-PaymentIntent נוצר ללא Stripe Customer. הכרטיס לא יישמר ב-Stripe ולא ב-DB. | 🟠 גבוה | 2026-08-13 | — | פתוח |
| S6-02 | `donation_service.py:41` | חסר | `quick_button_slug` מתקבל ב-`DonationCreate` אך לא מתבצע lookup ל-`QuickButton` — `quick_button_id` ב-DB נשאר `NULL` לכל תרומה מכפתור מהיר. | 🟠 גבוה | 2026-08-13 | — | פתוח |

---

## S-7 | Backend — webhooks.py

**קבצים עיקריים:** `backend/app/routers/webhooks.py`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S7-01 | `webhooks.py:17` | stub | Webhook מחזיר `{"received": True}` ללא אימות חתימה ועיבוד אירועים. `payment_intent.succeeded` לא מעדכן status — תרומות יישארו `pending` לנצח בפרודקשן. ממתין ל-ABD-66 (Sprint 4, אחרי cloud deploy). | 🟠 גבוה | 2026-08-13 | ABD-66 | פתוח |

---

## S-8 | Frontend — formatAmount.ts + useCurrency.ts

**קבצים עיקריים:** `prayers-app/utils/formatAmount.ts`, `prayers-app/hooks/useCurrency.ts`

| # | קובץ:שורה | סוג | תיאור הממצא | חומרה | תאריך | טיקט | סטטוס |
|---|---|---|---|---|---|---|---|
| S8-01 | `formatAmount.ts` (TODO קיים) | בעיה | ARS הוא zero-decimal currency ב-Stripe (סכומים בפסוס שלמים, לא סנטבוס). הקוד מחלק את כל הסכומים ב-100 — תרומת ARS 5,000 תוצג כ-50. מוצג בהיסטוריה ובאישור תרומה בצורה שגויה. | 🟠 גבוה | 2026-08-13 | — | פתוח |
| S8-02 | `useCurrency.ts:12` | stub | `detectCurrency()` לא נקראת — ה-hook מחזיר ILS קשיח. geo-detection (AR→ARS, US→USD וכו') לא פועל בפועל. | 🟠 גבוה | 2026-08-13 | — | פתוח |

---

## ממצאים שנסגרו (תוקנו ב-main)

| # | תיאור | תוקן ב | מוזג |
|---|---|---|---|
| ~~S-02~~ | `DonationConfirm` חסר שדה `save_card` | ABD-60 | ✅ |
| ~~S-05~~ | `create_or_get_customer` / `attach_payment_method` חסרות | ABD-60 | ✅ |

</div>
