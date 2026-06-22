"""
שירות משתמשים — לוגיקה עסקית ושאילתות DB.

TODO (צוות הפרקטיקום): לממש מול SQLAlchemy session + Firebase Admin.
"""

from sqlalchemy.orm import Session


def get_or_create_user(db: Session, firebase_uid: str):
    """TODO: מחזיר User קיים לפי firebase_uid, או יוצר חדש (כולל anonymous)."""
    raise NotImplementedError


def update_preferences(
    db: Session, firebase_uid: str, lang: str | None = None, currency: str | None = None
):
    """TODO: UPDATE users SET preferred_lang/preferred_currency."""
    raise NotImplementedError


def remove_saved_card(db: Session, firebase_uid: str):
    """
    TODO:
    1. stripe_service.detach_payment_method(...)
    2. UPDATE users SET has_saved_card=False, saved_card_last4=None, saved_card_brand=None
    """
    raise NotImplementedError
