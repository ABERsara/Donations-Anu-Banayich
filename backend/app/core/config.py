"""
הגדרות אפליקציה — נקראות ממשתני סביבה (.env).
ריכוז ההגדרות במקום אחד — אין os.getenv מפוזר ב-routers/services.
"""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "Prayers API"
    APP_VERSION: str = "1.0.0"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://user:password@localhost:5432/prayers_db"
    )
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8081")

    # ─── Stripe ──────────────────────────────────────────────
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # ─── Firebase ────────────────────────────────────────────
    # נתיב ל-service-account.json או תוכן ה-JSON עצמו
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")

    @property
    def cors_origins(self) -> list[str]:
        return [self.FRONTEND_URL]


settings = Settings()
