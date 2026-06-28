# Sprint 1 Team Plan — פונדמנט + תפילות
**Sprint window:** weeks 1–2 | **Goal:** working prayer list, end-to-end, in the hands of both developers

> **Sprint Goal:** PostgreSQL is running locally, 5 Hebrew prayers are seeded, the Prayers API returns real data, and the app displays the prayer list with navigation to the prayer page showing static donation tier buttons.

**How tasks are assigned:** They aren't. The two developers self-select from the pool below. The only rule: pick a 🚨 BLOCKER before anything it unblocks. Sara reviews every PR; the second developer reviews it first.

---

## קומפוננטות משותפות — קראו לפני שמתחילים F5 או F6

**כלל הזהב:** לפני כל קומפוננטה חדשה — בדקו את הרשימה הזו. אם היא כבר קיימת, השתמשו בה כמות שהיא. אל תכתבו מחדש.

**⚠️ נקודת סינכרון עם חברת הצוות:** לפני שמתחילים F5 או F6, שבו ביחד (5 דקות) ועברו על הטבלה הזו שורה אחת שורה אחת. ודאו שאתן מסכימות על מי משתמשת במה — ושאף אחת לא כותבת בנפרד קומפוננטה שכבר קיימת.

### קומפוננטות בשימוש בספרינט 1

| קומפוננטה | ייבוא | Props | מצב | משימות שמשתמשות |
|---|---|---|---|---|
| `Button` | `@/components/common` | `label`, `variant?` (primary/secondary/ghost), `isLoading?`, `fullWidth?`, `style?` | **מלאה** — אל תשנו | F6 (not-found + DonationWidget) |
| `LoadingSpinner` | `@/components/common` | ללא props | **stub** — עובד, אין לוגו עדיין | F5 (בית) + F6 (עמוד תפילה) |
| `Input` | `@/components/common` | `label?`, `error?`, `rtl?` + TextInputProps | **stub** — לא נדרש בספרינט 1 | — |
| `AppBottomSheet` | `@/components/common` | — | **stub** — ספרינט 2 | — |
| `PrayerCard` | `@/components/PrayerCard` | `prayer: LocalizedPrayer` | **מלאה** — קומפוננטת דוגמא, אל תשנו | F5 (בית) |

### Hook משותף: `usePrayer.ts`

שתי הפונקציות יושבות באותו קובץ `prayers-app/hooks/usePrayer.ts`:

| פונקציה | מי מממשת | מתי |
|---|---|---|
| `usePrayers()` | מי שלוקחת F5 | F5 — מוסיפה מתחת ל-stub הקיים |
| `usePrayer(slug)` | מי שלוקחת F6 | F6 — ממלאת את ה-stub הקיים |

**אם שתי מפתחות שונות לוקחות F5 ו-F6:** PR של F5 חייב להתמזג ל-`main` לפני שמתחילים את F6. אחרת יהיה merge conflict בקובץ הזה.

### כיצד מייבאים

```tsx
// קומפוננטות common — ייבוא אחד לכולן:
import { Button, LoadingSpinner, Input, AppBottomSheet } from '@/components/common';

// PrayerCard — ייבוא נפרד:
import { PrayerCard } from '@/components/PrayerCard';

// Hooks:
import { usePrayers } from '@/hooks/usePrayer';   // F5
import { usePrayer }  from '@/hooks/usePrayer';   // F6
```

---

## PREREQUISITE — Dev Environment Setup (both devs, independently, before sprint starts)
**Jira:** ABD-5

This is not a selectable task — **both developers must complete it** before any development can happen. Estimate S (≈1 day) per developer.

### What to do

**Backend:**
1. `cd backend`
2. `python -m venv .venv` then activate: Windows → `.venv\Scripts\activate`, Mac/Linux → `source .venv/bin/activate`
3. `pip install -r requirements.txt && pip install -r requirements-dev.txt`
4. `cp .env.example .env` — fill in values:
   - `DATABASE_URL=postgresql://user:password@localhost:5432/prayers_db` (matches docker-compose)
   - `STRIPE_SECRET_KEY=sk_test_...` (from Stripe Dashboard → Test mode)
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (from Stripe CLI or Dashboard)
   - `FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json` — download `serviceAccountKey.json` from Firebase Console → Project Settings → Service Accounts → Generate new private key
5. `docker-compose up -d` — starts PostgreSQL on port 5432
6. `uvicorn app.main:app --reload`
7. Verify: `GET http://localhost:8000/health` → `{"status": "ok"}`
8. Verify: `GET http://localhost:8000/docs` → Swagger UI showing prayers / donations / users / webhooks routers

**Frontend:**
1. `cd prayers-app && npm install`
2. `cp .env.example .env` — fill in values:
   - `EXPO_PUBLIC_API_URL=http://localhost:8000`
   - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` (from Stripe Dashboard → Test mode, the pk_ one NOT sk_)
   - Firebase config vars: `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID` (from Firebase Console → Project Settings → Your apps)
3. `npx expo start` → press `w` for web or scan QR for phone

**Pitfalls:**
- Firebase: download the JSON, rename it to `firebase-service-account.json`, place it in `backend/`. Add it to `.gitignore` if not already there — **never commit it**.
- Stripe: use test keys only (`sk_test_...` / `pk_test_...`). Live keys (`sk_live_...`) are never used locally.
- `EXPO_PUBLIC_*` variables belong in `prayers-app/.env`, not `backend/.env`.
- Docker Desktop must be running before `docker-compose up`.

**Verification:** Both devs show each other `GET /health` returning 200 and the Expo web app loading.

---

## Feature 1: Foundation (Database + Seed)

### F2 — 🚨 BLOCKER: DB Migration + Seed Data
**Jira:** ABD-6

**`**Goal:**`** Add the `prayer_name` column to the Donation model, create the initial database schema via Alembic autogenerate, write a seed script, and populate the DB with 5 Hebrew prayers. This unblocks the Prayers API (F3) and all frontend testing against real data.

**`**Context:**`** The backend models are already fully defined in `backend/app/models/models.py` — but one column is missing: `prayer_name` on `Donation`. This must be added **before** running autogenerate, because this is the first and only clean initial migration. Adding it later requires a separate ALTER TABLE migration that's riskier in production. `backend/alembic/versions/` is currently empty (only `env.py` exists). `backend/scripts/seed.py` does not exist yet.

This task gates F3 (Prayers API can't be tested without tables), which in turn gates F5 and F6 (frontend can't use real data). Pick this up early.

**`**Effort:**`** M (≈2–3 days)

**`**Dependencies:**`** Prereq (dev environment running)

**`**Out of scope:**`** English seed data (Sprint 4), any migration after the initial one, any frontend work

**`**Acceptance criteria:**`**
- [ ] `prayer_name = Column(String, nullable=True)` is present in the `Donation` class in `models.py`
- [ ] `prayer_name: str | None = None` is present in `DonationCreate` in `schemas.py`
- [ ] `alembic revision --autogenerate -m "initial"` creates a migration file in `backend/alembic/versions/` — open it and confirm it contains CREATE TABLE for prayers, users, donations, categories, quick_buttons, recurring_donations **and** the `prayer_name` column on donations
- [ ] `alembic upgrade head` runs without errors
- [ ] `backend/scripts/seed.py` exists and is runnable
- [ ] `python scripts/seed.py` prints success; `SELECT COUNT(*) FROM prayers` → 5; `SELECT COUNT(*) FROM categories` → 5
- [ ] `GET http://localhost:8000/api/prayers` → JSON array (currently `[]` until F3 fills the service — that's fine)
- [ ] PR reviewed by the other developer, then approved by Sara before merge to `main`

### Steps

**Step 1 — Add `prayer_name` to the Donation model**

Open `backend/app/models/models.py`. Find the `Donation` class (line ~65). After the `donor_name` column, add:

```python
prayer_name = Column(String, nullable=True)  # שם לתפילה — נפרד מ-donor_name (שם לקבלה)
```

The distinction matters: `donor_name` is for the receipt (who donated), `prayer_name` is the name of the person being prayed for (used when amount ≥ threshold, Sprint 2 configures the UI gate).

**Step 2 — Add `prayer_name` to `DonationCreate` schema**

Open `backend/app/schemas/schemas.py`. In `DonationCreate`, after `donor_note`:

```python
prayer_name: str | None = None
```

**Step 3 — Run autogenerate**

With `docker-compose up -d` running and `.env` set:

```bash
cd backend
# make sure venv is active
alembic revision --autogenerate -m "initial"
```

This generates a file like `backend/alembic/versions/xxxx_initial.py`. **Open that file and read it.** Verify:
- `op.create_table('prayers', ...)` is there
- `op.create_table('donations', ...)` includes a `prayer_name` column
- All 6 tables appear: prayers, users, donations, categories, quick_buttons, recurring_donations

If `prayer_name` is missing from the donations create_table, you forgot Step 1 — delete the generated file and redo from Step 1.

**Step 4 — Apply the migration**

```bash
alembic upgrade head
```

No errors. Then verify in psql (or pgAdmin):

```sql
\dt                             -- lists all 6 tables
SELECT column_name FROM information_schema.columns WHERE table_name='donations';
-- should include: prayer_name
```

**Step 5 — Write `backend/scripts/seed.py`**

Create the file. It does not exist yet. Pattern to follow — use `SessionLocal` from `app.database` and the model classes from `app.models.models`:

```python
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))  # so 'app' is importable

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.models import Category, Prayer

CATEGORIES = [
    {"slug": "health",   "name_he": "בריאות"},
    {"slug": "success",  "name_he": "הצלחה"},
    {"slug": "exam",     "name_he": "מבחנים"},
    {"slug": "travel",   "name_he": "נסיעות"},
    {"slug": "baby",     "name_he": "ילדים"},
]

PRAYERS = [
    {
        "slug": "health",
        "title_he": "תפילה לרפואה שלמה",
        "body_he": "רבונו של עולם, אתה רופא כל בשר ומפליא לעשות. בקשתי לפניך שתשלח רפואה שלמה מן השמים לחולים ולחולות בישראל...",
        "seo_description_he": "תפילה לרפואה שלמה — בקשה לה׳ לשמור על הבריאות ולהביא ריפוי לחולה",
        "seo_keywords_he": ["תפילה לרפואה", "תפילה לחולה", "רפואה שלמה"],
        "category_slug": "health",
    },
    {
        "slug": "success",
        "title_he": "תפילה להצלחה",
        "body_he": "ריבונו של עולם, בידך להצליח את דרכי ולהאיר את עיני. אנא עזור לי להצליח במעשי ידיי ובכל אשר אפנה...",
        "seo_description_he": "תפילה להצלחה בעסקים, בעבודה ובחיי היומיום — בקשה לברכה ועזרה מאת ה׳",
        "seo_keywords_he": ["תפילה להצלחה", "ברכה לעסק", "תפילה לפרנסה"],
        "category_slug": "success",
    },
    {
        "slug": "exam",
        "title_he": "תפילה לפני מבחן",
        "body_he": "אנא ה׳, פתח לבי בתורתך ויאיר שכלי. בשעת המבחן תסייע לי לזכור כל מה שלמדתי ולכתוב בהצלחה...",
        "seo_description_he": "תפילה קצרה לפני מבחן — בקשה לסיוע, זיכרון ורוגע בשעת הבחינה",
        "seo_keywords_he": ["תפילה לפני מבחן", "תפילה לבחינה", "תפילה לסטודנט"],
        "category_slug": "exam",
    },
    {
        "slug": "travel",
        "title_he": "תפילה לנסיעה בטוחה",
        "body_he": "יהי רצון מלפניך ה׳ אלוהי ואלוהי אבותי, שתוליכני לשלום ותצעידני לשלום ותדריכני לשלום...",
        "seo_description_he": "תפילת הדרך המסורתית לנסיעה בטוחה — לשמירה על הדרך ביבשה, בים ובאוויר",
        "seo_keywords_he": ["תפילת הדרך", "תפילה לנסיעה", "שמירה בדרך"],
        "category_slug": "travel",
    },
    {
        "slug": "baby",
        "title_he": "תפילה לברכת ילדים",
        "body_he": "אבינו שבשמים, אתה הוא שנותן פרי בטן ומברך את עמך ישראל בבנים ובבנות. שמע תפילתנו ופקוד אותנו בזרע של קיימא...",
        "seo_description_he": "תפילה לברכת ילדים ולפריון — בקשה כנה לה׳ לזכות בבנים ובנות",
        "seo_keywords_he": ["תפילה לילדים", "תפילה לפריון", "ברכת בנים"],
        "category_slug": "baby",
    },
]

def seed():
    db = SessionLocal()
    try:
        # categories
        cat_map = {}
        for c in CATEGORIES:
            existing = db.query(Category).filter_by(slug=c["slug"]).first()
            if not existing:
                cat = Category(slug=c["slug"], name_he=c["name_he"])
                db.add(cat)
                db.flush()  # get the id
                cat_map[c["slug"]] = cat.id
            else:
                cat_map[c["slug"]] = existing.id
        db.commit()
        print(f"Categories ready: {len(CATEGORIES)}")

        # prayers
        count = 0
        for p in PRAYERS:
            existing = db.query(Prayer).filter_by(slug=p["slug"]).first()
            if not existing:
                prayer = Prayer(
                    slug=p["slug"],
                    title_he=p["title_he"],
                    body_he=p["body_he"],
                    seo_description_he=p["seo_description_he"],
                    seo_keywords_he=p["seo_keywords_he"],
                    category_id=cat_map[p["category_slug"]],
                    is_active=True,
                )
                db.add(prayer)
                count += 1
        db.commit()
        print(f"Prayers seeded: {count} new (skipped duplicates)")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
```

**Pitfalls:**
- **Run the seed from inside `backend/`**: `cd backend && python scripts/seed.py`. The `sys.path.append` makes `app` importable.
- Use `db.flush()` before using a new object's `id` (it generates the UUID before committing).
- The seed is idempotent — safe to run twice. It skips rows with existing slugs.
- Prayer body text above is a short placeholder. Write real ~100-word Hebrew prayer texts for each — ask Sara or use traditional prayer texts.
- `Column(ARRAY(String))` in `seo_keywords_he` requires PostgreSQL — it won't work with SQLite.

---

## Feature 2: Prayers API

### F3 — Prayers API Backend
**Jira:** ABD-7

**`**Goal:**`** Fill in the 4 prayer service functions and wire the 4 router endpoints so they return real prayer data from the DB. After this task, the frontend can call `GET /api/prayers` and get a list of 5 Hebrew prayers.

**`**Context:**`** `backend/app/services/prayer_service.py` has all 4 function signatures but every body is `raise NotImplementedError`. `backend/app/routers/prayers.py` has all 4 routes but they return empty lists or placeholder dicts. `backend/app/schemas/schemas.py` `PrayerResponse` needs to be expanded to include all fields the frontend's `LocalizedPrayer` type expects (see Sprint 1 Sync Point in the basis file).

**The front↔back contract for this sprint:**
```
Backend PrayerResponse → Frontend LocalizedPrayer
id            → id
slug          → slug
title         → title         (mapped from Prayer.title_{lang})
body          → body          (mapped from Prayer.body_{lang})
seo_description → seoDescription (mapped from Prayer.seo_description_{lang})
seo_keywords  → seoKeywords  (mapped from Prayer.seo_keywords_{lang})
lang          → lang
category_id   → categoryId
```

Share the field names with the frontend dev before building — 5-minute conversation. This is the Sprint 1 Sync Point.

**`**Effort:**`** M (≈2–3 days)

**`**Dependencies:**`** F2 (tables must exist + seed data present)

**`**Out of scope:**`** English language support (Sprint 4), auth middleware (Sprint 3), donation endpoints, webhook endpoints

**`**Acceptance criteria:**`**
- [ ] `GET /api/prayers?lang=he` → JSON array with 5 prayers, each with `id, slug, title, body, seo_description, seo_keywords, lang, category_id`
- [ ] `GET /api/prayers/health?lang=he` → single prayer with `title: "תפילה לרפואה שלמה"`
- [ ] Two rapid calls to `GET /api/prayers/health` → `view_count` in DB increases each time (verify in psql)
- [ ] `GET /api/prayers/search?q=רפואה&lang=he` → returns the health prayer
- [ ] `GET /api/prayers/category/health?lang=he` → returns the health prayer
- [ ] `GET /api/prayers/nonexistent` → 404 (not a 500 crash)
- [ ] Router stays thin: no business logic in router functions — all in service
- [ ] `ruff check .` passes on backend code
- [ ] PR reviewed by the other developer, then approved by Sara before merge to `main`

### Steps

**Step 1 — Expand `PrayerResponse` schema**

Open `backend/app/schemas/schemas.py`. Replace the `PrayerResponse` class:

```python
class PrayerResponse(BaseModel):
    id: str
    slug: str
    title: str | None = None
    body: str | None = None
    seo_description: str | None = None
    seo_keywords: list[str] | None = None
    lang: str = "he"
    category_id: str | None = None
    view_count: int = 0

    model_config = ConfigDict(from_attributes=True)
```

**Step 2 — Write a `_localize` helper in `prayer_service.py`**

This helper converts a `Prayer` ORM object + a lang string into a `PrayerResponse`. Add it at the top of the service file (above the 4 public functions):

```python
from app.models.models import Prayer as PrayerModel
from app.schemas.schemas import PrayerResponse


def _localize(prayer: PrayerModel, lang: str) -> PrayerResponse:
    """Map a Prayer ORM object to PrayerResponse for a given language, with he fallback."""
    supported = ["he", "en", "fr", "ru", "es", "ar"]
    if lang not in supported:
        lang = "he"

    title = getattr(prayer, f"title_{lang}", None) or prayer.title_he
    body = getattr(prayer, f"body_{lang}", None) or prayer.body_he
    seo_desc = getattr(prayer, f"seo_description_{lang}", None) or prayer.seo_description_he
    seo_kw = getattr(prayer, f"seo_keywords_{lang}", None) or prayer.seo_keywords_he or []

    return PrayerResponse(
        id=str(prayer.id),
        slug=prayer.slug,
        title=title,
        body=body,
        seo_description=seo_desc,
        seo_keywords=seo_kw,
        lang=lang,
        category_id=str(prayer.category_id) if prayer.category_id else None,
        view_count=prayer.view_count,
    )
```

**Step 3 — Implement `list_prayers`**

```python
def list_prayers(db: Session, lang: str = "he") -> list[PrayerResponse]:
    prayers = db.query(PrayerModel).filter(PrayerModel.is_active == True).all()
    return [_localize(p, lang) for p in prayers]
```

**Step 4 — Implement `get_prayer_by_slug`**

```python
from fastapi import HTTPException

def get_prayer_by_slug(db: Session, slug: str, lang: str = "he") -> PrayerResponse:
    prayer = db.query(PrayerModel).filter(
        PrayerModel.slug == slug,
        PrayerModel.is_active == True,
    ).first()
    if not prayer:
        raise HTTPException(status_code=404, detail="Prayer not found")
    prayer.view_count += 1
    db.commit()
    return _localize(prayer, lang)
```

**Step 5 — Implement `list_by_category`**

```python
from app.models.models import Category

def list_by_category(db: Session, category: str, lang: str = "he") -> list[PrayerResponse]:
    prayers = (
        db.query(PrayerModel)
        .join(Category, PrayerModel.category_id == Category.id)
        .filter(Category.slug == category, PrayerModel.is_active == True)
        .all()
    )
    return [_localize(p, lang) for p in prayers]
```

**Step 6 — Implement `search_prayers`**

```python
def search_prayers(db: Session, q: str, lang: str = "he") -> list[PrayerResponse]:
    supported = ["he", "en", "fr", "ru", "es", "ar"]
    if lang not in supported:
        lang = "he"
    title_col = getattr(PrayerModel, f"title_{lang}")
    body_col = getattr(PrayerModel, f"body_{lang}")
    prayers = (
        db.query(PrayerModel)
        .filter(
            PrayerModel.is_active == True,
            (title_col.ilike(f"%{q}%") | body_col.ilike(f"%{q}%")),
        )
        .all()
    )
    return [_localize(p, lang) for p in prayers]
```

**Step 7 — Wire the router (`prayers.py`)**

Replace each stub in `backend/app/routers/prayers.py`. The router calls service functions and returns results:

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import prayer_service
from app.schemas.schemas import PrayerResponse

router = APIRouter(prefix="/api/prayers", tags=["prayers"])


@router.get("/", response_model=list[PrayerResponse])
def list_prayers(lang: str = "he", db: Session = Depends(get_db)):
    return prayer_service.list_prayers(db, lang)


@router.get("/search", response_model=list[PrayerResponse])
def search_prayers(q: str, lang: str = "he", db: Session = Depends(get_db)):
    return prayer_service.search_prayers(db, q, lang)


@router.get("/category/{category}", response_model=list[PrayerResponse])
def prayers_by_category(category: str, lang: str = "he", db: Session = Depends(get_db)):
    return prayer_service.list_by_category(db, category, lang)


@router.get("/{slug}", response_model=PrayerResponse)
def get_prayer(slug: str, lang: str = "he", db: Session = Depends(get_db)):
    return prayer_service.get_prayer_by_slug(db, slug, lang)
```

**Important:** Keep route order as written above. FastAPI matches routes top-to-bottom, so `/search` and `/category/{category}` must be declared **before** `/{slug}` — otherwise `/search` would be treated as a slug.

**Pitfalls:**
- `getattr(PrayerModel, f"title_{lang}")` returns a SQLAlchemy column descriptor (usable in `.filter()` with `.ilike()`). Don't confuse this with `getattr(prayer_instance, f"title_{lang}")` which returns the actual string value.
- UUID `id` from the ORM is a Python `UUID` object — always `str(prayer.id)` before putting it in the response.
- `view_count += 1` only persists if you call `db.commit()` after. Without commit, the count reverts on the next request.
- Never put business logic (DB queries) in the router. The router only: accepts request → calls service → returns result.
- `from fastapi import HTTPException` — the 404 is raised in the service, not the router. That's fine.

---

## Feature 3: App Foundation

### F4 — App Foundation: Complete `_layout.tsx`
**Jira:** ABD-8

**`**Goal:**`** Complete the app's startup sequence so Firebase anonymous sign-in runs at launch, and the Stripe provider wraps the navigator. After this task, the app opens cleanly with a Firebase anonymous user created in the background.

**`**Context:**`** `prayers-app/app/_layout.tsx` already calls `initI18n()` and `initializeStripe()` in a `Promise.all`. Two things are missing: `signInAnon()` is not called (so no Firebase user is created at launch), and `StripeProvider` doesn't wrap the navigator yet. `firebase.ts` and `api.ts` are both complete — you don't touch them. `useAuth.ts` is still a stub — calling it here is safe (it returns `{user: null, isLoading: true}` without crashing).

**`**Effort:**`** S (≈1 day)

**`**Dependencies:**`** Prereq (Firebase project configured, `.env` filled with Firebase keys)

**`**Out of scope:**`** Implementing `useAuth` hook (Sprint 3), actual Google Sign-In (Sprint 3), language store initialization (Sprint 4)

**`**Acceptance criteria:**`**
- [ ] App opens on web (`npx expo start` → `w`) without any red error screen or crash
- [ ] Firebase Console → Authentication → Users shows a new anonymous user created within a minute of app launch
- [ ] Calling `apiFetch('/api/prayers')` from the app works (no CORS or auth error on GET endpoints)
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] PR reviewed by the other developer, then approved by Sara before merge to `main`

### Steps

1. **Open `prayers-app/app/_layout.tsx`.**

2. **Add the `signInAnon` import** at the top (after existing imports):
   ```tsx
   import { signInAnon } from '@/services/firebase';
   ```

3. **Add `signInAnon()` to the `Promise.all`** inside `useEffect`:
   ```tsx
   Promise.all([
     initI18n(),
     initializeStripe(),
     signInAnon(),   // ← add this line
   ]).then(() => setReady(true));
   ```

4. **Add the `StripeProvider` wrapper.** First, add the import:
   ```tsx
   import { StripeProvider } from '@stripe/stripe-react-native';
   ```
   Then wrap `<I18nextProvider>...</I18nextProvider>` with it:
   ```tsx
   <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
     <I18nextProvider i18n={i18n}>
       <Stack screenOptions={{ headerShown: false }} />
     </I18nextProvider>
   </StripeProvider>
   ```

5. **Add the `useAuth()` call** inside `RootLayout` (before the `if (!ready)` check):
   ```tsx
   import { useAuth } from '@/hooks/useAuth';
   // inside function RootLayout():
   useAuth();  // stub for now; initializes auth listener in Sprint 3
   ```

6. **Test:** `npx expo start` → `w` (or scan QR). No crash. Check Firebase Console after 30 seconds for a new anonymous user.

**Pitfalls:**
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` must be in `prayers-app/.env`. If it's empty, Stripe will warn but won't crash the app in test mode.
- `signInAnon()` from `firebase.ts` is the anonymous sign-in — it's silent (no UI). Do not add any UI for it.
- Don't confuse `StripeProvider` (wraps the nav tree) with `initializeStripe()` (initializes the SDK — already called in Promise.all). Both are needed.
- After adding `useAuth()`, run `npm run type-check` to confirm no TypeScript errors.

---

## Feature 4: Home Screen

### F5 — Home Screen: Prayer List
**Jira:** ABD-9

**`**Goal:**`** The home screen shows a scrollable list of 5 prayer cards using `FlatList`. While fetching, a LoadingSpinner is shown. If the API fails, an error message appears. Tapping a card navigates to the prayer page.

**`**Context:**`** `prayers-app/app/(tabs)/index.tsx` already imports `QuickButtons` and `AppDownloadBanner` but has a TODO comment where the prayer list should go. `PrayerCard` is a complete reference example — use it directly, don't modify it. The `usePrayers()` list hook does not exist yet — you'll add it to `hooks/usePrayer.ts` (same file that has the `usePrayer(slug)` stub). `getPrayers()` in `services/api.ts` already exists and calls `GET /api/prayers`.

**Front↔back contract:** `getPrayers()` returns `LocalizedPrayer[]` — confirm with the backend dev that the response shape matches (id, slug, title, body, seoDescription, seoKeywords, lang, categoryId). You can develop against the stub/mock and integrate once F3 is done.

**`**Effort:**`** M (≈2–3 days)

**`**Dependencies:**`** F4 (app foundation must be working). F3 for full acceptance test (can mock data until then).

**`**Out of scope:**`** QuickButtons implementation (Sprint 3), search functionality (Sprint 5), AppDownloadBanner (Sprint 5), prayer categories filter

**`**Acceptance criteria:**`**
- [ ] Home screen renders 5 PrayerCard components with Hebrew titles and preview text
- [ ] `LoadingSpinner` is visible briefly on first load (can be seen on a slow connection or by adding a temporary `await new Promise(r => setTimeout(r, 2000))` in dev)
- [ ] Error state shows a translated message (not hardcoded Hebrew) when API is unreachable
- [ ] Tapping any PrayerCard navigates to `/prayer/[slug]`
- [ ] No hardcoded Hebrew strings in JSX — all via `t('key')`
- [ ] `npm run lint` and `npm run type-check` pass
- [ ] PR reviewed by the other developer, then approved by Sara before merge to `main`

### Steps

**Step 1 — Add `usePrayers()` to `hooks/usePrayer.ts`**

Open the file. It already has `usePrayer(slug)` stub at the top. Add `usePrayers()` **below** the existing stub (don't remove the existing stub — it's needed for F6):

```typescript
import { useEffect, useState } from 'react';
import { getPrayers } from '@/services/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LocalizedPrayer } from '@/types/prayer.types';

export function usePrayers(): {
  prayers: LocalizedPrayer[];
  isLoading: boolean;
  error: string | null;
} {
  const { lang } = useLanguageStore();
  const [prayers, setPrayers] = useState<LocalizedPrayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getPrayers()
      .then((data) => setPrayers(data as LocalizedPrayer[]))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [lang]);

  return { prayers, isLoading, error };
}
```

Note: `getPrayers()` in `api.ts` doesn't pass `lang` as a query param (it calls `API.PRAYERS` without params). For Sprint 1, this is fine — the backend defaults to Hebrew. Lang-aware fetching is a Sprint 4 concern.

**Step 2 — Wire the home screen (`app/(tabs)/index.tsx`)**

Replace the current file contents:

```tsx
import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePrayers } from '@/hooks/usePrayer';
import { PrayerCard } from '@/components/PrayerCard';
import { LoadingSpinner } from '@/components/common';
import { QuickButtons } from '@/components/QuickButtons';
import { AppDownloadBanner } from '@/components/AppDownloadBanner';
import type { LocalizedPrayer } from '@/types/prayer.types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { prayers, isLoading, error } = usePrayers();

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <Text style={styles.error}>{t('error.loading')}</Text>;
    return (
      <FlatList<LocalizedPrayer>
        data={prayers}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PrayerCard prayer={item} />}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <AppDownloadBanner />
      <QuickButtons />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list:  { paddingBottom: 16 },
  error: { textAlign: 'center', marginTop: 24 },
});
```

**Step 3 — Add missing i18n key**

Open `prayers-app/i18n/he.json`. Search for `error.loading`. If it doesn't exist, add it:
```json
"error": {
  "loading": "שגיאה בטעינה, נסה שוב"
}
```

(Add inside the existing JSON structure — don't duplicate a key that already exists.)

**Step 4 — Test**

Run `npx expo start` → `w`. The home screen should show 5 prayer cards. Tap one — it should navigate to the prayer page (even if the prayer page is still the placeholder skeleton).

If F3 isn't done yet: temporarily in `usePrayers`, replace the `getPrayers()` call with mock data to test the UI. Remove the mock before opening the PR.

**Pitfalls:**
- Check `i18n/he.json` BEFORE adding any `t('key')` call — copy the exact key format already used in the file.
- `FlatList` renders items lazily — if you only have 5 items, they'll all appear. Use `keyExtractor` to avoid warnings.
- `QuickButtons` and `AppDownloadBanner` are stubs that return `<Text>...</Text>` — they won't crash. Leave them as-is for Sprint 1.
- Don't modify `PrayerCard` — it already handles RTL and navigation correctly.
- Network errors (API not running) should show the error state — not a blank screen or crash.

---

## Feature 5: Prayer Page

### F6 — Prayer Page + DonationWidget Shell
**Jira:** ABD-10

**`**Goal:**`** The prayer page loads the full prayer text. Below the scrollable text, a sticky `DonationWidget` shows 5 donation tier buttons (₪18 / ₪36 / ₪72 / ₪180 / ₪360). Tapping a button highlights it. The "Donate" button exists but does nothing yet (payment is Sprint 2).

**`**Context:**`** `prayers-app/app/prayer/[slug].tsx` already has the right structure: it calls `usePrayer(slug)`, shows a `LoadingSpinner`, renders `prayer.title` and `prayer.body`, and includes `<DonationWidget prayerId={prayer.id} />`. The two gaps are: (1) `usePrayer(slug)` always returns `{prayer: null, isLoading: true}` (stub) — fill the body; (2) `DonationWidget` renders `<Text>DonationWidget — TODO</Text>` — implement tier buttons.

`donationStore.ts` is complete and provides `selectedTier`, `selectTier`, and `currency`. `DONATION_TIERS` in `constants/donations.ts` is complete (array of tiers per currency). The `Button` component in `components/common/Button.tsx` is complete — use it.

**`**Effort:**`** M (≈2–3 days)

**`**Dependencies:**`** F5 (navigation from home screen must work so you can test the prayer page). F3 (for real prayer data).

**`**Out of scope:**`** Payment processing (Sprint 2), DonationBottomSheet (Sprint 2), success animation (Sprint 2), custom amount input (Sprint 2), not-found redirect to home

**`**Acceptance criteria:**`**
- [ ] Navigate from home screen → prayer card tap → prayer page shows Hebrew title and full body text
- [ ] `LoadingSpinner` shows while prayer is loading (briefly)
- [ ] If slug is invalid, shows "תפילה לא נמצאה" message and a back button
- [ ] Five tier buttons visible at the bottom: ₪18, ₪36, ₪72, ₪180, ₪360 (for ILS default)
- [ ] Tapping a tier button changes its visual style (highlighted/selected state)
- [ ] "Donate" button is visible but its `onPress` is a no-op with a comment explaining Sprint 2
- [ ] No hardcoded Hebrew strings — all via `t('key')` + `he.json`
- [ ] `npm run lint` and `npm run type-check` pass
- [ ] PR reviewed by the other developer, then approved by Sara before merge to `main`

### Steps

**Step 1 — Fill `usePrayer(slug)` hook body**

Open `prayers-app/hooks/usePrayer.ts`. The `usePrayer(slug)` function is currently a stub. Replace just its body (keep `usePrayers()` that F5 added):

```typescript
import { getPrayer } from '@/services/api';  // already in api.ts

export function usePrayer(slug: string): {
  prayer: LocalizedPrayer | null;
  isLoading: boolean;
  error: string | null;
} {
  const { lang } = useLanguageStore();
  const [prayer, setPrayer] = useState<LocalizedPrayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    getPrayer(slug)
      .then((data) => setPrayer(data as LocalizedPrayer))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug, lang]);

  return { prayer, isLoading, error };
}
```

Add the necessary imports at the top of the file (`useState`, `useEffect` from react, `useLanguageStore`, `LocalizedPrayer` type) — some may already be there from F5; don't duplicate.

**Step 2 — Complete `app/prayer/[slug].tsx`**

The file already imports `usePrayer`, `LoadingSpinner`, and `DonationWidget`. Add the not-found state and clean up the layout:

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePrayer } from '@/hooks/usePrayer';
import { LoadingSpinner, Button } from '@/components/common';
import { DonationWidget } from '@/components/DonationWidget';

export default function PrayerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { prayer, isLoading, error } = usePrayer(slug);
  const { t } = useTranslation();
  const router = useRouter();

  if (isLoading) return <LoadingSpinner />;

  if (!prayer || error) {
    return (
      <View style={styles.center}>
        <Text>{t('prayer.not_found')}</Text>
        <Button label={t('common.back')} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{prayer.title}</Text>
        <Text style={styles.body}>{prayer.body}</Text>
      </ScrollView>

      {/* Sticky bottom — Sprint 2 adds payment. Sprint 1: tier buttons only */}
      <View style={styles.bottomBar}>
        <DonationWidget prayerId={prayer.id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1 },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title:   { fontSize: 22, fontWeight: '700', textAlign: 'right', marginBottom: 16 },
  body:    { fontSize: 16, lineHeight: 30, textAlign: 'right' },
  bottomBar: { borderTopWidth: 1, borderColor: '#eee' },
  center:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
```

**Step 3 — Add i18n keys**

Open `prayers-app/i18n/he.json`. Add if missing:
```json
"prayer": {
  "not_found": "תפילה לא נמצאה"
},
"common": {
  "back": "חזרה"
},
"donation": {
  "donate": "תרום"
}
```

Search for each key before adding — don't duplicate.

**Step 4 — Implement `DonationWidget.tsx`**

Open `prayers-app/components/DonationWidget/DonationWidget.tsx`. Replace the TODO stub:

```tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDonationStore } from '@/store/donationStore';
import { useLanguageStore } from '@/store/languageStore';
import { DONATION_TIERS } from '@/constants/donations';
import { Button } from '@/components/common';
import type { DonationTier } from '@/types/donation.types';

interface DonationWidgetProps {
  prayerId: string;
}

export function DonationWidget({ prayerId }: DonationWidgetProps) {
  const { t } = useTranslation();
  const { currency } = useLanguageStore();
  const { selectedTier, selectTier } = useDonationStore();

  // Sprint 1: local state for bottom sheet open (Sprint 2 implements the actual sheet)
  const [sheetOpen, setSheetOpen] = useState(false);

  const tiers: DonationTier[] = DONATION_TIERS[currency] ?? DONATION_TIERS.ILS;

  return (
    <View style={styles.container}>
      <View style={styles.tiersRow}>
        {tiers.map((tier) => {
          const isSelected = selectedTier?.amount === tier.amount;
          return (
            <TouchableOpacity
              key={tier.amount}
              style={[styles.tierBtn, isSelected && styles.selected]}
              onPress={() => selectTier(tier)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tierLabel, isSelected && styles.selectedLabel]}>
                {tier.display}  {/* ₪18/₪36/₪72... — tier.label = גימטריה, tier.display = סכום */}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        label={t('donation.donate')}
        onPress={() => {
          // TODO Sprint 2: open DonationBottomSheet
          // setSheetOpen(true);
        }}
        style={styles.donateBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { padding: 16, backgroundColor: '#fff' },
  tiersRow:   { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tierBtn:    {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  selected:   { borderColor: '#8B6914', backgroundColor: '#FDF3DC' },
  tierLabel:  { fontSize: 14, color: '#444' },
  selectedLabel: { color: '#8B6914', fontWeight: '700' },
  donateBtn:  { marginTop: 4 },
});
```

**Check before writing:** Open `prayers-app/constants/donations.ts` to confirm the `DonationTier` type shape (it has at minimum `amount: number` and `label: string`). Open `prayers-app/components/common/Button.tsx` to confirm the `label` and `onPress` prop names. Adjust your code to match exactly what those files export.

**Step 5 — Test end-to-end**

1. Home screen → tap "תפילה לרפואה שלמה" → prayer page loads
2. Hebrew title at top, full prayer body below
3. Scroll works
4. 5 tier buttons at bottom
5. Tap ₪72 → button highlights
6. Tap another → previous unhighlights, new one highlights
7. Tap "תרום" → nothing happens (expected for Sprint 1)

**Pitfalls:**
- `DONATION_TIERS[currency]` — `currency` from `languageStore` defaults to `'ILS'`. If you see undefined, add `?? DONATION_TIERS.ILS` as fallback.
- `selectTier(tier)` takes a full `DonationTier` object, not just the amount. Pass the full `tier` from the `.map()`.
- `flexDirection: 'row-reverse'` makes RTL — the buttons flow right-to-left as expected in Hebrew UI.
- Do NOT implement `DonationBottomSheet` in Sprint 1. Leave the `TODO Sprint 2` comment in the `onPress`.
- The `Button` component already has styling. Don't re-style it inline unless the `style` prop accepts overrides — check the component's prop types first.
- `npm run type-check` may complain about the `DonationTier` type if `DONATION_TIERS` isn't typed correctly. Fix the import, don't add `any`.

---

## Task Pool Table

| Task | Feature | Effort | Dependencies | Status |
|------|---------|--------|-------------|--------|
| Prereq — Dev Environment | Foundation | S (both devs) | none | **both devs complete first** |
| F2 — DB Migration + Seed | Foundation | M | Prereq | 🚨 available |
| F3 — Prayers API Backend | Prayers API | M | F2 | available |
| F4 — App Foundation | App Foundation | S | Prereq | available |
| F5 — Home Screen: Prayer List | Home Screen | M | F3 + F4 | available |
| F6 — Prayer Page + DonationWidget | Prayer Page | M | F5 | available |

---

## Dependency Graph

```
Prereq (env setup — both devs)
  ├── F2 🚨 BLOCKER: Migration + Seed
  │     └── F3: Prayers API Backend
  │           └── F5: Home Screen ──── F6: Prayer Page + DonationWidget
  └── F4: App Foundation ──────────────┘
```

**Read before picking a task:**
- F2 gates F3. Pick F2 immediately — it takes 2–3 days and unblocks the entire backend.
- F4 is independent. The second developer can start F4 + F5 UI scaffolding while F2+F3 are being built.
- F5 depends on F3 for full acceptance testing, but the UI can be developed with mock data in the hook.
- F6 depends on F5 (navigation must work).

---

## Sync Points

| What | When | Who | How |
|------|------|-----|-----|
| **רשימת קומפוננטות משותפות** | יום 1, לפני שמתחילים F5 ו-F6 | שתי המפתחות | 5 דקות ביחד — עוברות על טבלת "קומפוננטות משותפות" שורה אחת שורה אחת. מסכימות מי משתמשת במה ומאשרות שאף אחת לא מתכננת לכתוב מחדש קומפוננטה קיימת. |
| **`PrayerResponse` ↔ `LocalizedPrayer` contract** | Day 1, before F3 and F5 start building | Both devs | 5-minute conversation to align on field names from the basis file. Backend dev shares the expanded PrayerResponse; frontend dev confirms it matches `LocalizedPrayer` in `types/prayer.types.ts`. |
| **API is running and returning data** | When F3 PR is merged | Frontend dev | Switch `usePrayers` from mock data to live API; run end-to-end test. |
| **PR review gate** | Every PR | Both devs + Sara | Other dev reviews first, then Sara approves before merge to `main`. No exceptions. |

---

## Backlog

No Sprint 1 items are deferred. Scope is well within capacity (≈55% loaded). Nothing to cut.

Items known to be out of scope for Sprint 1 (already scoped to later sprints in SPEC.md):
- Stripe payment processing → Sprint 2
- Firebase Auth middleware (verify tokens) → Sprint 3
- Google Sign-In UI → Sprint 3
- QuickButtons implementation → Sprint 3
- Language picker / multilingual → Sprint 4
- Search screen → Sprint 5
- AppDownloadBanner → Sprint 5
- EAS mobile build → Sprint 5

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `prayer_name` missing from initial migration | HIGH | Verify in Step 3 of F2: open the generated migration file and confirm `prayer_name` column appears in the donations table before running `upgrade head` |
| `PrayerResponse` / `LocalizedPrayer` field mismatch | HIGH | Align on contract verbally on Day 1 (see Sync Points). Frontend `LocalizedPrayer` type is the source of truth — backend must match it. |
| Local env setup delays (Docker, Firebase creds) | MEDIUM | Budget a full day for each dev. Firebase service account JSON must be downloaded before development starts. |
| Frontend blocked waiting for F3 | LOW | Developer doing frontend (F4+F5) can build against mock data in `usePrayers` / `usePrayer`. Mock returns 2 hardcoded prayers. Remove mock before PR. |
| F5 and F6 in same file (`usePrayer.ts`) | LOW | F5 adds `usePrayers()` and F6 fills `usePrayer()`. If same dev takes both, no issue. If different devs: the F5 PR must be merged before F6 starts. |

**Gap audit (SPEC.md required capabilities vs. Sprint 1):**

| Capability (SPEC Sprint 1) | Status |
|---|---|
| `docker-compose up` + `uvicorn` + `/health` | Built (Prereq — no code change needed) |
| `prayer_name` column in Donation model | Planned → F2 |
| Alembic initial migration | Planned → F2 |
| Seed: 5 prayers + 5 categories | Planned → F2 |
| `GET /api/prayers` | Planned → F3 |
| `GET /api/prayers/{slug}` + view_count | Planned → F3 |
| `GET /api/prayers/search?q=` | Planned → F3 |
| `GET /api/prayers/category/{slug}` | Planned → F3 |
| App opens, Firebase anon user | Planned → F4 |
| Home screen prayer list | Planned → F5 |
| Prayer page with content | Planned → F6 |
| DonationWidget tier buttons (static) | Planned → F6 |

All Sprint 1 requirements are planned. No gaps.

---

## Definition-of-Ready Checklist

All tasks pass:

- [x] **Code-checked** — each task verified against actual repo files; "what exists now" written in
- [x] **Full detail present** — What + Context + Where + Steps + Pitfalls + proof-of-done for every task
- [x] **Acceptance criteria** present — `- [ ]` checklists with spec-level items + review gate
- [x] **Front↔back contract** named — PrayerResponse ↔ LocalizedPrayer contract documented in basis file and Sprint 1 Sync Point
- [x] **Format valid** — `**Goal:**` / `**Context:**` / `**Effort:**` / `**Dependencies:**` / `**Out of scope:**` / `**Acceptance criteria:**` markers present on all tasks; no owner fields
- [x] **No task bundles >2 deliverables** — F2 (model change + migration + seed) is the densest; it's sequentially related (seed depends on tables), not independent deliverables
