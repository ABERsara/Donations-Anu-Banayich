"""
Rate limiting דרך slowapi — הגנת abuse / DDoS.

שימוש ב-route:
    from app.middleware.rate_limit import limiter

    @router.post("/quick")
    @limiter.limit("5/minute")
    async def quick_donate(request: Request, ...):
        ...

TODO (צוות הפרקטיקום): להגדיר מגבלות ספציפיות per-route (בעיקר על donations / auth).
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def init_rate_limit(app) -> None:
    """לחבר את ה-limiter ל-FastAPI app (נקרא מ-main.py)."""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
