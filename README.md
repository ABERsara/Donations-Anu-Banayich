# מערכת תפילות — Prayers Platform

פלטפורמה רב-ערוצית (Web + iOS + Android) לתפילה, תרומה ושיתוף.

## מבנה המאגר

```
Donations/
├── prayers-app/    # Frontend — Expo Router (TypeScript)
└── backend/        # Backend  — FastAPI (Python)
```

## דרישות מקדימות

| כלי | גרסה מינימלית |
|-----|--------------|
| Node.js | 20 LTS |
| npm / yarn / bun | npm 10+ |
| Python | 3.12+ |
| PostgreSQL | 16+ |

## התחלה מהירה

```bash
# 1. שכפל את המאגר
git clone <repo-url>
cd Donations

# 2. הפעל Frontend
cd prayers-app
npm install
npm run dev          # Web: http://localhost:8081

# 3. הפעל Backend (טרמינל נפרד)
cd backend
python -m venv .venv

# Mac / Linux:
source .venv/bin/activate

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# אם מופיעה שגיאת הרשאות, הרץ פעם אחת:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

## מסמכים

- [Frontend README](./prayers-app/README.md) — Expo, i18n, Stripe
- [Backend README](./backend/README.md) — FastAPI, PostgreSQL, Firebase Admin
- [CONTRIBUTING.md](./CONTRIBUTING.md) — קונבנציות קוד, כלים אוטומטיים, Naming
- [CHECKLIST.md](./CHECKLIST.md) — רשימת תיוג לפני PR
- [אפיון מערכת](./אפיון-מערכת-תפילות.md) — מסמך אפיון מלא
