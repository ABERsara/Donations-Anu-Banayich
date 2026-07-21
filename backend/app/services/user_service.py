"""
שירות משתמשים — לוגיקה עסקית ושאילתות DB.

"""

import stripe
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.models import User
from app.services.stripe_service import detach_payment_method, get_default_payment_method


def get_or_create_user(db: Session, firebase_uid: str, email: str | None = None):
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is not None:
        return user

    user = User(firebase_uid=firebase_uid, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_preferences(
    db: Session, firebase_uid: str, lang: str | None = None, currency: str | None = None
):
    """UPDATE users SET preferred_lang/preferred_currency."""
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if lang is not None:
        user.preferred_lang = lang
    if currency is not None:
        user.preferred_currency = currency

    db.commit()
    return user


async def remove_saved_card(db: Session, firebase_uid: str):
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user.stripe_customer_id is not None:
        pm_result = await get_default_payment_method(user.stripe_customer_id)
        payment_method_id = pm_result["payment_method_id"]

        if payment_method_id is not None:
            try:
                await detach_payment_method(payment_method_id)
            except stripe.error.StripeError as e:
                raise HTTPException(status_code=502, detail=f"Failed to remove card: {e}") from e

    user.has_saved_card = False
    user.saved_card_last4 = None
    user.saved_card_brand = None

    db.commit()
    return user
