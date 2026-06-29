"""
Seed script — מאכלס את ה-DB ב-5 קטגוריות ו-5 תפילות עבריות.
אידמפוטנטי: בטוח להריץ פעמיים (מדלג על slug קיים).
הרצה: cd backend && python scripts/seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.models import Category, Prayer


def seed():
    db = SessionLocal()
    try:
        # ─── קטגוריות ────────────────────────────────────────────
        categories_data = [
            {"slug": "shacharit", "name_he": "שחרית", "name_en": "Shacharit", "order": 1},
            {"slug": "mincha", "name_he": "מנחה", "name_en": "Mincha", "order": 2},
            {"slug": "arvit", "name_he": "ערבית", "name_en": "Arvit", "order": 3},
            {"slug": "musaf", "name_he": "מוסף", "name_en": "Musaf", "order": 4},
            {"slug": "neilah", "name_he": "נעילה", "name_en": "Neilah", "order": 5},
        ]

        category_map = {}
        for data in categories_data:
            existing = db.query(Category).filter_by(slug=data["slug"]).first()
            if existing:
                print(f"  קטגוריה קיימת, מדלג: {data['slug']}")
                category_map[data["slug"]] = existing
            else:
                cat = Category(**data)
                db.add(cat)
                db.flush()
                category_map[data["slug"]] = cat
                print(f"  נוספה קטגוריה: {data['name_he']}")

        # ─── תפילות ──────────────────────────────────────────────
        prayers_data = [
            {
                "slug": "shacharit-amida",
                "category_slug": "shacharit",
                "title_he": "תפילת שחרית",
                "title_en": "Morning Prayer",
                "body_he": "תפילת השחרית היא תפילת הבוקר הנאמרת מדי יום עם זריחת השמש.",
                "body_en": "The Shacharit prayer is the morning prayer recited daily at sunrise.",
            },
            {
                "slug": "mincha-amida",
                "category_slug": "mincha",
                "title_he": "תפילת מנחה",
                "title_en": "Afternoon Prayer",
                "body_he": "תפילת המנחה נאמרת בשעות אחר הצהריים, מחצות היום ועד השקיעה.",
                "body_en": "The Mincha prayer is recited in the afternoon, from midday until sunset.",
            },
            {
                "slug": "arvit-amida",
                "category_slug": "arvit",
                "title_he": "תפילת ערבית",
                "title_en": "Evening Prayer",
                "body_he": "תפילת הערבית נאמרת לאחר צאת הכוכבים, בסיום היום.",
                "body_en": "The Arvit prayer is recited after nightfall, at the end of the day.",
            },
            {
                "slug": "musaf-shabbat",
                "category_slug": "musaf",
                "title_he": "תפילת מוסף",
                "title_en": "Additional Prayer",
                "body_he": "תפילת המוסף נאמרת בשבתות וימים טובים, לאחר תפילת שחרית.",
                "body_en": "The Musaf prayer is recited on Shabbat and holidays, after Shacharit.",
            },
            {
                "slug": "neilah-yom-kippur",
                "category_slug": "neilah",
                "title_he": "תפילת נעילה",
                "title_en": "Closing Prayer",
                "body_he": "תפילת נעילה היא התפילה האחרונה של יום הכיפורים, בשעת נעילת שערי שמים.",
                "body_en": "The Neilah prayer is the final prayer of Yom Kippur, as the gates of heaven close.",
            },
        ]

        for data in prayers_data:
            existing = db.query(Prayer).filter_by(slug=data["slug"]).first()
            if existing:
                print(f"  תפילה קיימת, מדלג: {data['slug']}")
                continue

            category_slug = data.pop("category_slug")
            prayer = Prayer(category_id=category_map[category_slug].id, **data)
            db.add(prayer)
            print(f"  נוספה תפילה: {data['title_he']}")

        db.commit()
        print("\n✅ Seed הושלם בהצלחה!")

        # ─── אימות ───────────────────────────────────────────────
        prayer_count = db.query(Prayer).count()
        category_count = db.query(Category).count()
        print(f"   תפילות ב-DB: {prayer_count}")
        print(f"   קטגוריות ב-DB: {category_count}")

    except Exception as e:
        db.rollback()
        print(f"❌ שגיאה: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
