"""
TODO: Prayers Router
GET /api/prayers
GET /api/prayers/:slug
GET /api/prayers/category/:category
GET /api/prayers/search?q=
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/api/prayers", tags=["prayers"])


@router.get("/")
def list_prayers(db: Session = Depends(get_db)):
    # TODO: לממש — שאילתת DB + LocalizedPrayer לפי lang param
    return []


@router.get("/search")
def search_prayers(q: str, db: Session = Depends(get_db)):
    # TODO: prayer_service.search_prayers(db, q) — full-text search ב-PostgreSQL
    return []


@router.get("/category/{category}")
def prayers_by_category(category: str, db: Session = Depends(get_db)):
    # TODO: prayer_service.list_by_category(db, category)
    return []


@router.get("/{slug}")
def get_prayer(slug: str, db: Session = Depends(get_db)):
    # TODO: prayer_service.get_prayer_by_slug(db, slug)
    return {"slug": slug}
