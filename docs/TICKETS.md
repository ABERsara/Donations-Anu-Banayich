<div dir="rtl">

# TICKETS — מצב כל הטיקטים

**עדכון אחרון:** 2026-08-13  
**מקורות:** `git branch -r --merged origin/main` + Jira REST API (`/rest/api/3/search/jql`)

> מקרא: **main** = merged ל-main · **בענף** = ברנץ' קיים, טרם מוזג · **אין ברנץ'** = אפילו ברנץ' לא נוצר

---

## Sprint 1 (SCRUM Sprint 1)

| Key | כותרת | סטטוס git | סטטוס Jira |
|---|---|---|---|
| ABD-6 | Project Setup | ✅ main | Done |
| ABD-7 | Prayers API (GET /prayers) | ✅ main | Done |
| ABD-8 | Prayer Detail Screen | ❌ בענף | — |
| ABD-9 | Home Screen — Prayer List | ✅ main | Done |
| ABD-10 | Donations Basic Flow (Prayer Page Widget) | ✅ main | Done |

---

## Sprint 2 (SCRUM Sprint 2)

| Key | כותרת | סטטוס git | סטטוס Jira |
|---|---|---|---|
| ABD-11 | Payment Intent + Donation Service | ✅ main | Done |
| ABD-12 | Stripe Webhook (initial) | ✅ main | Done |
| ABD-13 | Donation Widget Trigger | ✅ main | Done |
| ABD-14 | Payment Sheet — Stripe React Native | ❌ בענף | Done |

> ⚠️ ABD-14 מסומן Done ב-Jira אך **לא מוזג ל-main**. מכיל תיקון קריטי לבאג S2-01. חובה למזג לפני Sprint 3 frontend.

---

## Sprint 3 (SCRUM Sprint 3)

| Key | כותרת | סטטוס git | סטטוס Jira | ממצאים |
|---|---|---|---|---|
| ABD-59 | Firebase Auth Middleware + User Service | ✅ main | Done | — |
| ABD-60 | Saved Card: Stripe Customer + Users API | ✅ main | Done | — |
| ABD-61 | Quick Donate: 2-Tap Charge | ❌ בענף | Approved with Comments | S3-01 |
| ABD-62 | Firebase Auth: useAuth Hook + Login Screen | ❌ אין ברנץ' | To Do | — |
| ABD-63 | DonationBottomSheet: Saved Card Branch | ❌ אין ברנץ' | To Do | — |
| ABD-64 | Quick Buttons: Full Implementation | ❌ אין ברנץ' | To Do | — |
| ABD-66 | Stripe Webhooks | ❌ אין ברנץ' | To Do | — |
| ABD-65 | Cloud Deploy | backlog | To Do | — |

---

## טיקטי באגים (מחוץ לסברינטים)

| Key | כותרת | סטטוס Jira | ממצא |
|---|---|---|---|
| ABD-67 | DonationResponse: הוסף camelCase aliases | To Do | S1-01 |
| ABD-68 | RecurringDonationResponse: הוסף camelCase aliases | To Do | S1-02 |

---

## סיכום: מה חסם Sprint 3 frontend

| חסם | מי פותר | מצב |
|---|---|---|
| ABD-14 לא מוזג (Payment Sheet קורסת) | merge ABD-14 | ❌ |
| ABD-59 לא היה מוזג (auth stub 501) | ✅ מוזג | ✅ |
| ABD-60 לא היה מוזג (save_card חסר) | ✅ מוזג | ✅ |
| ABD-61 לא מוזג (charge_saved_card stub) | ממתין לתיקון comments ואז merge | ❌ |
| ABD-67 פתוח (DonationResponse undefined) | 2-3 שורות ב-schemas.py | ❌ |

</div>
