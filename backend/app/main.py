"""
נקודת כניסה — FastAPI.
מבנה השכבות: router → schema → service → model (ראה CONTRIBUTING.md).
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.rate_limit import init_rate_limit
from app.routers import donations, prayers, users, webhooks

load_dotenv()

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# ─── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Rate limiting (slowapi) ─────────────────────────────────
init_rate_limit(app)

# ─── Firebase Admin ──────────────────────────────────────────
# TODO (צוות הפרקטיקום): לאתחל firebase-admin עם settings.FIREBASE_CREDENTIALS
#   import firebase_admin
#   from firebase_admin import credentials
#   firebase_admin.initialize_app(credentials.Certificate(...))

# ─── Routers ─────────────────────────────────────────────────
app.include_router(prayers.router)
app.include_router(donations.router)
app.include_router(users.router)
app.include_router(webhooks.router)


@app.get("/health")
def health():
    return {"status": "ok"}
