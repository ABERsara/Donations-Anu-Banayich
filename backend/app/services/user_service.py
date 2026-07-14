"""
שירות משתמשים — לוגיקה עסקית ושאילתות DB.

TODO (צוות הפרקטיקום): לממש מול SQLAlchemy session + Firebase Admin.
"""

from sqlalchemy.orm import Session

from app.models.models import User


def get_or_create_user(db: Session, firebase_uid: str, email: str | None = None):
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is not None:
        return user

    user = User(firebase_uid=firebase_uid, email=email)
    db.add(user)
    db.commit()
    return user


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
