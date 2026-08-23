"""
תלויות משותפות ל-routes (FastAPI Depends) — re-export נוח במקום אחד.
שימוש: from app.core.dependencies import get_db, verify_firebase_token
"""

from app.database import get_db
from app.middleware.auth import get_optional_user, verify_firebase_token

__all__ = ["get_db", "verify_firebase_token", "get_optional_user"]
