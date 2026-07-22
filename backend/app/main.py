"""
נקודת כניסה — FastAPI.
מבנה השכבות: router → schema → service → model (ראה CONTRIBUTING.md).
"""

import truststore

truststore.inject_into_ssl()

import firebase_admin
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import credentials

load_dotenv()

from app.core.config import settings  # noqa: E402
from app.middleware.rate_limit import init_rate_limit  # noqa: E402
from app.routers import donations, prayers, users, webhooks  # noqa: E402

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
if not settings.FIREBASE_CREDENTIALS_PATH:
    raise RuntimeError(
        "FIREBASE_CREDENTIALS_PATH is not set. "
        "Add it to your .env file (see README for setup instructions)."
    )

cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)


# ─── Routers ─────────────────────────────────────────────────
app.include_router(prayers.router)
app.include_router(donations.router)
app.include_router(users.router)
app.include_router(webhooks.router)


@app.get("/health")
def health():
    return {"status": "ok"}
