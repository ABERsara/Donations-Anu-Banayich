"""
Seed script — מאכלס את ה-DB ב-5 קטגוריות ו-5 תפילות עבריות.
אידמפוטנטי: בטוח להריץ פעמיים (מדלג על slug קיים).
הרצה: cd backend && python scripts/seed.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal
from app.models.models import Category, Prayer


def seed():
    db = SessionLocal()
    try:
        # ─── קטגוריות ────────────────────────────────────────────
        categories_data = [
            {"slug": "health", "name_he": "רפואה", "name_en": "Health", "order": 1},
            {"slug": "success", "name_he": "הצלחה", "name_en": "Success", "order": 2},
            {"slug": "exam", "name_he": "מבחן", "name_en": "Exam", "order": 3},
            {"slug": "travel", "name_he": "נסיעה", "name_en": "Travel", "order": 4},
            {"slug": "baby", "name_he": "לידה", "name_en": "Baby", "order": 5},
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
                "slug": "health-prayer",
                "category_slug": "health",
                "title_he": "תפילה לרפואה שלמה",
                "title_en": "Prayer for Healing",
                "body_he": "תפילה לרפואה שלמה ובריאות טובה.",
                "body_en": "A prayer for complete healing and good health.",
            },
            {
                "slug": "success-prayer",
                "category_slug": "success",
                "title_he": "תפילה להצלחה",
                "title_en": "Prayer for Success",
                "body_he": "תפילה להצלחה בדרך ובמעשי ידיים.",
                "body_en": "A prayer for success in one's path and endeavors.",
            },
            {
                "slug": "exam-prayer",
                "category_slug": "exam",
                "title_he": "תפילה להצלחה במבחן",
                "title_en": "Prayer for Exam Success",
                "body_he": "תפילה לסייעתא דשמיא לפני מבחן.",
                "body_en": "A prayer for divine assistance before an exam.",
            },
            {
                "slug": "travel-prayer",
                "category_slug": "travel",
                "title_he": "תפילה לנסיעה בטוחה",
                "title_en": "Prayer for Safe Travel",
                "body_he": "תפילה לנוסעים, לשמירה בדרך.",
                "body_en": "A prayer for travelers, for safety on the road.",
            },
            {
                "slug": "baby-prayer",
                "category_slug": "baby",
                "title_he": "תפילה להריון ולידה",
                "title_en": "Prayer for Pregnancy and Birth",
                "body_he": "תפילה להריון בריא וללידה קלה.",
                "body_en": "A prayer for a healthy pregnancy and an easy birth.",
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
