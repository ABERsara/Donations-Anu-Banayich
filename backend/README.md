# backend — API Server

Python 3.12 · FastAPI · PostgreSQL · Stripe · Firebase Admin

---

## התקנה והרצה

### דרישות מקדימות
- **Python 3.12+** — [python.org](https://www.python.org)
- **PostgreSQL 16+** — מותקן ורץ מקומית
- חשבון **Stripe** ומפתחות API

---

### 1. Virtual Environment + התקנת חבילות

```bash
cd backend

# Windows
python -m venv .venv
.venv\Scripts\activate

# Mac/Linux
python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

---

### 2. יצירת מסד נתונים

```bash
# ב-psql
psql -U postgres
CREATE DATABASE prayers_db;
\q
```

---

### 3. משתני סביבה

```bash
cp .env.example .env
```

ערכים למלא:

| משתנה | איפה מוצאים |
|-------|-------------|
| `DATABASE_URL` | `postgresql://user:password@localhost:5432/prayers_db` |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API Keys → Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --print-secret` |
| `FIREBASE_CREDENTIALS_PATH` | Firebase Console → Project Settings → Service Accounts → Generate new private key |

---

### 4. Migrations (Alembic)

```bash
# יצירת טבלאות ראשונה
alembic upgrade head

# לאחר שינוי ב-models.py
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

---

### 5. הרצת השרת

```bash
uvicorn app.main:app --reload --port 8000
# http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

---

### 6. בדיקת Stripe Webhook (פיתוח)

```bash
# התקינו Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

---

## מבנה תיקיות

```
backend/
├── app/
│   ├── main.py              # ✅ FastAPI app + CORS (uncomment routers after impl)
│   ├── database.py          # ✅ SQLAlchemy engine + get_db dependency
│   │
│   ├── models/
│   │   └── models.py        # ✅ SQLAlchemy: Prayer, User, Donation, QuickButton, Category
│   │
│   ├── schemas/
│   │   └── schemas.py       # ✅ Pydantic: DonationCreate (מלא) + TODO לשאר
│   │
│   ├── routers/
│   │   ├── prayers.py       # TODO: GET /api/prayers (skeleton מוכן)
│   │   ├── donations.py     # TODO: POST initiate/quick (skeleton מוכן)
│   │   ├── users.py         # TODO: GET/PATCH/DELETE (skeleton מוכן)
│   │   └── webhooks.py      # TODO: POST /api/webhooks/stripe (skeleton מוכן)
│   │
│   ├── services/            # TODO: stripe_service, prayer_service, user_service
│   │
│   └── middleware/
│       ├── auth.py          # TODO: verify_firebase_token (skeleton מוכן)
│       └── rate_limit.py    # TODO: slowapi rate limiting
│
├── alembic/                 # DB Migrations
├── requirements.txt         # ✅
└── .env.example             # ✅
```

**מקרא:** ✅ = מוכן | TODO = ממתין למימוש

---

## סדר מימוש מומלץ

```
1. database.py          ← כבר מוכן, בדוק חיבור
2. models/models.py     ← השלם עמודות רב-לשוניות
3. alembic upgrade head ← יצור טבלאות
4. middleware/auth.py   ← Firebase token verification
5. routers/prayers.py   ← GET בסיסי
6. routers/donations.py ← initiate + Stripe
7. routers/webhooks.py  ← payment_intent.succeeded
8. routers/users.py     ← saved card flow
```

---

## Swagger UI

לאחר הרצה: [http://localhost:8000/docs](http://localhost:8000/docs)

כל ה-endpoints מתועדים אוטומטית על ידי FastAPI.
