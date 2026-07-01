"""
Prayers Router
GET /api/prayers
GET /api/prayers/search?q=
GET /api/prayers/category/{category}
GET /api/prayers/{slug}
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import PrayerResponse
from app.services import prayer_service

router = APIRouter(prefix="/api/prayers", tags=["prayers"])


@router.get("/", response_model=list[PrayerResponse])
def list_prayers(db: Session = Depends(get_db), lang: str = "he"):
    return prayer_service.list_prayers(db, lang)


@router.get("/search", response_model=list[PrayerResponse])
def search_prayers(q: str, db: Session = Depends(get_db), lang: str = "he"):
    return prayer_service.search_prayers(db, q, lang)


@router.get("/category/{category}", response_model=list[PrayerResponse])
def prayers_by_category(category: str, db: Session = Depends(get_db), lang: str = "he"):
    return prayer_service.list_by_category(db, category, lang)


@router.get("/{slug}", response_model=PrayerResponse)
def get_prayer(slug: str, db: Session = Depends(get_db), lang: str = "he"):
    return prayer_service.get_prayer_by_slug(db, slug, lang)
