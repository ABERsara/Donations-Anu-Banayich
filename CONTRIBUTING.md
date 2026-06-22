# Contributing — מדריך תרומת קוד (Prayers Platform)

קוד עובר Code Review לפני מיזוג. המסמך מתאר את הקונבנציות בשני צידי ה-monorepo:
**frontend** (Expo Router / TypeScript) ו-**backend** (FastAPI / Python / PostgreSQL).

> **TL;DR:** כלים אוטומטיים (ESLint + Prettier + Husky) אוכפים את הסגנון בצד ה-frontend.
> אל תעקוף את ה-hook עם `--no-verify`. פרק "עקרונות" הוא מה שהריוויוּ מחפש מעבר לזה.

---

## 1. כלים אוטומטיים

ה-pre-commit (Husky, ב-git root) מטפל **בשני הצדדים** בכל `git commit`:

| כלי | צד | מה הוא עושה | איך מריצים ידנית |
| --- | --- | --- | --- |
| **ESLint** | frontend | תופס שגיאות ותבניות קוד בעייתיות | `npm run lint` / `npm run lint:fix` |
| **Prettier** | frontend | מעצב את הקוד (רווחים, מרכאות, שורות) | `npm run format` / `npm run format:check` |
| **Ruff** | backend | פורמט + לינט (isort/pyflakes/pyupgrade/bugbear) בכלי אחד | `python -m ruff format .` / `python -m ruff check .` |
| **Husky (pre-commit)** | שניהם | frontend: `lint-staged` (eslint+prettier). backend: `ruff format` + `ruff check --fix` על קובצי `.py` שב-stage | רץ אוטומטית ב-`git commit` |

הגדרות העיצוב: frontend ב-[prayers-app/.prettierrc](prayers-app/.prettierrc) (`singleQuote`, `semi`, `tabWidth: 2`, `trailingComma: es5`, `printWidth: 100`); backend ב-[backend/pyproject.toml](backend/pyproject.toml) (`line-length: 100`, double quotes).

**אל תעקוף את ה-hook עם `--no-verify`** — אם משהו נשבר, תקנו את הסיבה ולא תעקפו.

> **Ruff בצד backend:** הפורמט נאכף; ה-lint מתקן אוטומטית מה שאפשר אך **אינו חוסם** commit על ממצאים שנותרו (כדי לא לחסום קוד TODO לגיטימי). התקנה ב-clone חדש: `pip install -r backend/requirements-dev.txt`.

---

## 2. עקרונות הפיתוח

### Naming Conventions

| סוג | קונבנציה | דוגמה |
| --- | --- | --- |
| משתנים ופונקציות (TS/JS) | `camelCase` | `formatAmount`, `detectCurrency` |
| קומפוננטות React | `PascalCase` | `PrayerCard`, `DonationWidget` |
| hooks | `camelCase` עם `use` | `useLanguage`, `useDonation` |
| Zustand stores | `camelCase` + סיומת `Store` | `authStore`, `donationStore` |
| קבועים | `UPPER_SNAKE_CASE` | `DONATION_TIERS`, `SUPPORTED_LANGS` |
| מודולים / פונקציות Python | `snake_case` | `get_prayer`, `create_donation` |
| מחלקות Python (models/schemas) | `PascalCase` | `Prayer`, `DonationCreate` |

### Single Responsibility (SRP)

**Frontend** — שכבות מופרדות:

```
app/          → מסכים בלבד (Expo Router, file-based) — קומפוזיציה + ניווט
components/    → UI מוצג, ללא לוגיקת רשת
hooks/         → לוגיקה שחוזרת (useAuth, usePrayer, useDonation)
services/      → קריאות רשת + SDK חיצוני (api.ts, firebase.ts, stripe.ts)
store/         → state גלובלי (Zustand)
utils/         → פונקציות טהורות (formatAmount, rtl, detectLanguage)
```

מסך לא קורא ל-`fetch` ישירות — הוא קורא ל-hook/service. רכיב UI לא מכיל לוגיקת תשלום.

**Backend** — שכבות FastAPI:

```
router → schema (Pydantic, validation) → service (לוגיקה) → model (SQLAlchemy/DB)
```

ה-router דק: קולט request, מאמת, מחזיר response. לוגיקה עסקית ב-service.

### DRY (Don't Repeat Yourself)

- Frontend: קוד חוזר → `utils/` או `services/` (לדוגמה `services/api.ts` לכל קריאת רשת — אל תכתבו `fetch` חוזר במסכים).
- Backend: לוגיקה חוזרת → service משותף; schemas ב-`schemas/`.

לפני כתיבת פונקציה חדשה — בדקו אם כבר קיימת ב-`utils`/`services`.

### Magic Numbers & Strings

ערכים קשיחים → קבוע בעל שם:

```ts
// ❌
if (amount > 1000) { ... }

// ✅
const MAX_QUICK_DONATION = 1000;
if (amount > MAX_QUICK_DONATION) { ... }
```

קבועי frontend ב-`constants/` (כבר קיים: `DONATION_TIERS`, `QUICK_BUTTONS`, `ROUTES`, `API`).

### i18n — תרגום ומחרוזות

אין מחרוזות קשיחות שמוצגות למשתמש בתוך הקוד — דרך `t('key')`:

```tsx
// ❌
<Text>תרום עכשיו</Text>

// ✅
<Text>{t('donate_now')}</Text>
```

מפתחות נשמרים ב-`i18n/<lang>.json`. **`he.json` הוא מקור האמת למפתחות** — כל שפה חדשה מעתיקה את אותם מפתחות (ראו "הוספת שפה חדשה" ב-[prayers-app/README.md](prayers-app/README.md)).
שימו לב ל-RTL: השתמשו ב-`utils/rtl` ובלוגיים (`paddingStart`/`marginEnd`) ולא שמאל/ימין קשיחים.

### Meaningful Comments

הקוד מסביר את עצמו דרך שמות נכונים. הערה מסבירה **למה**, לא **מה**:

```ts
// ❌ // מגדיל ב-1
count += 1;

// ✅ // Stripe דורש סכום באגורות (integer) — לכן *100
const amountInCents = Math.round(amount * 100);
```

---

## 3. צ'קליסט לפני פתיחת PR

- [ ] `npm run lint` עובר נקי (frontend)
- [ ] `npm run format:check` עובר נקי (frontend)
- [ ] `npm run type-check` עובר נקי (TypeScript)
- [ ] backend: מיגרציית Alembic נוצרה אם שיניתם schema
- [ ] שמות עקביים עם טבלת ה-Naming למעלה
- [ ] אין לוגיקה עסקית במסכים / ב-routers
- [ ] אין ערכי קסם — קבועים בעלי שם
- [ ] אין מחרוזות קשיחות שמוצגות למשתמש — `t('key')`
- [ ] סודות לא נכנסו ל-git (ראו `.env` ב-`.gitignore`)

ראו את [CHECKLIST.md](CHECKLIST.md) לרשימה מפורטת לפי תחום.

---

## 4. פרסום מיגרציות (backend)

ה-DB מנוהל ב-Alembic ([backend/alembic.ini](backend/alembic.ini)).

- **אל תריצו `ALTER TABLE` ידנית.** שינוי schema = `alembic revision --autogenerate` → קובץ מיגרציה תחת `alembic/versions/`, ואז `alembic upgrade head`.
- שינוי שובר (מחיקת/שינוי שם עמודה, הפיכת עמודה ל-NOT NULL) — שני שלבים: קודם migrate-first, ואז שחרור הקוד שמסתמך עליו.

---

## 5. מקורות מומלצים

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Clean Code / Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Refactoring.Guru](https://refactoring.guru/)
- [The Twelve-Factor App](https://12factor.net/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
