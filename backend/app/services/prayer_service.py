"""
שירות תפילות — לוגיקה עסקית ושאילתות DB.
ה-router קורא לפונקציות כאן ומחזיר את התוצאה (router → service → model).

TODO (צוות הפרקטיקום): לממש מול SQLAlchemy session + בחירת עמודות לפי שפה.
"""

from sqlalchemy.orm import Session


def list_prayers(db: Session, lang: str = "he"):
    """TODO: SELECT מכל התפילות הפעילות + מיפוי לשפה (title_<lang>, body_<lang>)."""
    raise NotImplementedError


def get_prayer_by_slug(db: Session, slug: str, lang: str = "he"):
    """TODO: SELECT לפי slug + מיפוי לשפה + הגדלת view_count."""
    raise NotImplementedError


def list_by_category(db: Session, category: str, lang: str = "he"):
    """TODO: SELECT לפי Category.slug."""
    raise NotImplementedError


def search_prayers(db: Session, q: str, lang: str = "he"):
    """TODO: full-text search ב-PostgreSQL (title/body/seo_keywords)."""
    raise NotImplementedError
