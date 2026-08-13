# רשימת תיוג לפני PR — Prayers Platform

מסמך עזר: עברו עליו לפני כל PR. אם סעיף לא רלוונטי — סמנו "לא רלוונטי", אל תתעלמו.
⭐ = סעיפים שבהם קל ליפול בפרויקט הזה.

> כללי הסגנון (Naming, SRP, DRY, i18n) מפורטים ב-[CONTRIBUTING.md](CONTRIBUTING.md).

---

## 0. איפה השפעת? — "מה נגעתי בעצם?"
הפרויקט הוא monorepo עם 2 צדדים. סמנו מה נגעתם:

- [ ] `prayers-app/` (Expo Router / TypeScript) — מסכים, components, hooks, store, services, i18n
- [ ] `backend/` (FastAPI + SQLAlchemy + Alembic + PostgreSQL) — routers, schemas, services, models

⭐ נגעת בשני הצדדים? ודאו שה-contract ביניהם (שמות שדות ב-JSON, types) תואם משני הקצוות.

---

## 1. קוד נקי וצורת קוד
- [ ] ⭐ עברת על [CONTRIBUTING.md](CONTRIBUTING.md)? (Naming: `camelCase` / `PascalCase` / `UPPER_SNAKE_CASE` / `snake_case` ב-Python)
- [ ] SRP נשמר: `app → hooks/services → store` בצד frontend; `router → schema → service → model` בצד backend?
- [ ] ⭐ **SRP ברמת פונקציה:** כל פונקציה עושה דבר אחד בלבד, ושמה מתאר בדיוק את כל מה שהיא עושה כולל side effects? (דוגמה להפרה: `verify_firebase_token` שגם מאמתת וגם יוצרת user ב-DB — שם מטעה; שמות ב-Python: `verify_and_get_or_create_user`)
- [ ] ⭐ **TODO שהושלם הוסר?** TODO שנשאר בקוד אחרי שהמשימה הושלמה ב-PR הזה מבלבל קוראות עתידיות — הסירו אותו.
- [ ] DRY: קוד חוזר הוצא ל-`utils/` / `services/`?
- [ ] אין "מספרי קסם" — קבועים בעלי שם?
- [ ] הערות מסבירות **למה**, לא **מה**?

---

## 2. Frontend — State / Navigation / i18n
- [ ] ⭐ state גלובלי דרך Zustand store (`store/*Store.ts`)? state מקומי שנשאר במסך נשאר מקומי?
- [ ] ניווט דרך Expo Router (file-based ב-`app/`) — לא ניווט ידני קשיח?
- [ ] ⭐ אין מחרוזות מוצגות קשיחות — הכול דרך `t('key')`, והמפתח קיים ב-`i18n/he.json`?
- [ ] ⭐ בדקת **RTL** (עברית/ערבית)? השתמשת ב-`utils/rtl` ובלוגיים (`paddingStart`/`marginEnd`)?
- [ ] קומפוננטות UI ללא לוגיקת רשת — קריאות רשת דרך `services/api.ts`?

---

## 3. Frontend — קריאות רשת ושגיאות
- [ ] ⭐ כל קריאת רשת עוברת דרך `services/api.ts` (ולא `fetch` מפוזר במסכים)?
- [ ] יש state של loading / error ב-UI, או שהמסך נתקע ב-Happy Flow?
- [ ] בדקת מקרי קצה: רשת נופלת, תשובת שרת 4xx/5xx, רשימה ריקה, טוקן פג?
- [ ] `EXPO_PUBLIC_*` נקראים מ-env ולא URL/מפתח קשיח בקוד?

---

## 4. Backend — Router → Schema → Service → Model
- [ ] ה-router רשום ב-`app` (FastAPI router include)?
- [ ] ⭐ לוגיקה עסקית ב-**service**, לא ב-router?
- [ ] קלט עובר validation דרך **Pydantic schema**?
- [ ] route שמצריך אימות מוגן (תלוי-dependency של auth)?
- [ ] ⭐ שמות שדות ב-response תואמים למה שה-frontend מצפה לו (`api.ts` / types)?
- [ ] ⭐ **אין side effects בזמן import במודולי קונפיג** (`config.py`, `settings.py`)? קריאות כמו `load_dotenv()`, חיבור ל-DB, או קריאות רשת שייכות ל-entry point (`main.py`) או ל-lifespan startup function — לא בגוף המודול.

---

## 5. Backend — DB / מיגרציות
- [ ] ⭐ שינית `models` (SQLAlchemy)? יצרת מיגרציה — `alembic revision --autogenerate`?
- [ ] ⭐ **לא הרצת `ALTER TABLE` ידנית** — רק דרך Alembic, אחרת ה-DB יסטה מהקוד.
- [ ] הוספת שדה חדש? יש ערך ברירת מחדל / nullable למשתמשים קיימים?
- [ ] שדה שצריך להיות `unique` הוגדר ככזה?
- [ ] ⭐ הוספת `db.commit()`? בדקי שיש `db.refresh(obj)` לפני החזרת האובייקט — בלי `refresh` שדות עם `server_default` (כמו `created_at`) יחזרו ריקים.
- [ ] ⭐ שינוי שובר (מחיקת/שינוי שם עמודה)? פוצל ל-migrate-first / שני PRs (ראו [CONTRIBUTING.md §4](CONTRIBUTING.md))?

---

## 6. תשלומים / Stripe / Firebase
- [ ] ⭐ סכום ל-Stripe נשלח באגורות (integer cents), לא ב-shekels float?
- [ ] מפתחות Stripe/Firebase מגיעים מ-`EXPO_PUBLIC_*` (frontend) / env (backend) — לא קשיחים?
- [ ] אימות Firebase: בדקת מסלול כושל (משתמש מבטל Google sign-in, טוקן פג)?
- [ ] webhook של Stripe (אם נגעת) מאומת חתימה בצד שרת?

---

## 7. סודות, ENV וקונפיג
- [ ] ⭐ סוד חדש (key/token/סיסמה) **לא** נכנס ל-git — ב-`.env` (שמכוסה ב-`.gitignore`)?
- [ ] עדכנת `.env.example` עם שם המפתח (ללא הערך) אם הוספת משתנה?
- [ ] אין IP/URL קשיח בקוד — נקרא מקונפיג?

---

## 8. בדיקות איכות לפני PR
- [ ] ⭐ הרצת `npm run lint` **וגם** `npm run format:check` (frontend) — שניהם נקיים?
- [ ] `npm run type-check` עובר (TypeScript)?
- [ ] backend: `python -m ruff check .` נקי (או שהממצאים שנותרו מודעים ומכוונים)?
- [ ] ה-pre-commit (Husky) רץ ולא נעקף ב-`--no-verify` (מטפל ב-frontend **ו-**backend)?
- [ ] backend: הקוד עולה (`uvicorn app.main:app`) והמיגרציות רצות?
- [ ] ⭐ אין סימני קונפליקט (`<<<<<<<`, `=======`, `>>>>>>>`) ואין קבצים מיותרים ב-diff?

---

## 9. שאלות "רגע לפני סיום"
1. **"תאר את הזרימה מקצה לקצה"** — מהמסך, דרך `api.ts`, ל-router, service, DB, וחזרה ל-UI. נקודה שלא ברורה = שם נופלים.
2. **"מי עוד נוגע בזה?"** — האם תפקיד/מסך אחר משתמש באותו endpoint / store / מפתח i18n?
3. **"מה קורה כשמשהו נכשל?"** — אם התשובה רק על Happy Flow, חסר טיפול בשגיאה.
