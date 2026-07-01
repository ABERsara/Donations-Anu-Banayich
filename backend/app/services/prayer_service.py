"""
שירות תפילות — לוגיקה עסקית ושאילתות DB.
ה-router קורא לפונקציות כאן ומחזיר את התוצאה (router → service → model).

"""

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.models import Category, Prayer
from app.schemas.schemas import PrayerResponse


def _localize(prayer: Prayer, lang: str) -> PrayerResponse:
    """ממפה אובייקט Prayer (ORM) + שפה מבוקשת ל-PrayerResponse, עם fallback ל-he."""

    title = getattr(prayer, f"title_{lang}", None) or prayer.title_he
    body = getattr(prayer, f"body_{lang}", None) or prayer.body_he

    effective_lang = lang if lang in ("he", "en") else "he"
    seo_description = (
        getattr(prayer, f"seo_description_{effective_lang}", None) or prayer.seo_description_he
    )
    seo_keywords = (
        getattr(prayer, f"seo_keywords_{effective_lang}", None) or prayer.seo_keywords_he or []
    )

    return PrayerResponse(
        id=str(prayer.id),
        slug=prayer.slug,
        title=title,
        body=body,
        seo_description=seo_description,
        seo_keywords=seo_keywords,
        lang=lang,
        category_id=str(prayer.category_id) if prayer.category_id else None,
        view_count=prayer.view_count,
    )


def list_prayers(db: Session, lang: str = "he"):
    prayers = db.query(Prayer).filter(Prayer.is_active == True).all()
    return [_localize(p, lang) for p in prayers]


def get_prayer_by_slug(db: Session, slug: str, lang: str = "he"):
    prayer = db.query(Prayer).filter(Prayer.slug == slug, Prayer.is_active == True).first()

    if prayer is None:
        raise HTTPException(status_code=404, detail="Prayer not found")

    prayer.view_count += 1
    db.commit()
    db.refresh(prayer)

    return _localize(prayer, lang)


def list_by_category(db: Session, category: str, lang: str = "he"):
    prayers = (
        db.query(Prayer)
        .join(Category, Prayer.category_id == Category.id)
        .filter(Category.slug == category, Prayer.is_active == True)
        .all()
    )
    return [_localize(p, lang) for p in prayers]


def search_prayers(db: Session, q: str, lang: str = "he"):
    title_col = getattr(Prayer, f"title_{lang}", Prayer.title_he)
    body_col = getattr(Prayer, f"body_{lang}", Prayer.body_he)

    prayers = (
        db.query(Prayer)
        .filter(Prayer.is_active == True, (title_col.ilike(f"%{q}%")) | (body_col.ilike(f"%{q}%")))
        .all()
    )
    return [_localize(p, lang) for p in prayers]
