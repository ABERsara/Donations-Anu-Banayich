"""
שירות תרומות — לוגיקה עסקית לתרומות חד-פעמיות וחוזרות.
משלב בין ה-DB (Donation / RecurringDonation) ל-stripe_service.

TODO (צוות הפרקטיקום): לממש.
"""

import uuid

import stripe as stripe_sdk
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.constants import DONATION_STATUS_FAILED, DONATION_STATUS_SUCCESS
from app.models.models import Donation, Prayer, User
from app.schemas.schemas import QuickDonationResponse
from app.services import stripe_service


async def create_pending_donation(db: Session, data, current_user: User | None = None):
    user_id = None
    if current_user:
        user_id = current_user.id
    try:
        prayer_uuid = uuid.UUID(data.prayer_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid prayer_id format") from e
    prayer = db.query(Prayer).filter(Prayer.id == prayer_uuid).first()
    if prayer is None:
        raise HTTPException(status_code=404, detail="Prayer not found")
    try:
        stripe_result = await stripe_service.create_payment_intent(
            amount=data.amount,
            currency=data.currency.value,
            customer_id=None,
        )
    except stripe_sdk.error.StripeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    donation = Donation(
        user_id=user_id,
        prayer_id=prayer_uuid,
        amount=data.amount,
        currency=data.currency.value,
        donor_name=data.donor_name,
        prayer_name=data.prayer_name,
        donor_note=data.donor_note,
        receipt_email=data.receipt_email,
        stripe_payment_intent_id=stripe_result["payment_intent_id"],
    )
    db.add(donation)
    db.commit()

    return {
        "client_secret": stripe_result["client_secret"],
        "payment_intent_id": stripe_result["payment_intent_id"],
    }


async def confirm_donation(db: Session, payment_intent_id: str):
    donation = (
        db.query(Donation).filter(Donation.stripe_payment_intent_id == payment_intent_id).first()
    )
    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found")
    donation.status = DONATION_STATUS_SUCCESS
    db.commit()
    return {"status": "success"}


async def fail_donation(db: Session, payment_intent_id: str):
    donation = (
        db.query(Donation).filter(Donation.stripe_payment_intent_id == payment_intent_id).first()
    )
    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found")
    donation.status = DONATION_STATUS_FAILED
    db.commit()
    return {"status": "failed"}


async def quick_donation(db: Session, data, current_user: User):
    if not current_user.has_saved_card:
        raise HTTPException(status_code=400, detail="No saved card")

    try:
        prayer_uuid = uuid.UUID(data.prayer_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid prayer_id format") from e
    prayer = db.query(Prayer).filter(Prayer.id == prayer_uuid).first()
    if prayer is None:
        raise HTTPException(status_code=404, detail="Prayer not found")

    try:
        stripe_result = await stripe_service.charge_saved_card(
            customer_id=current_user.stripe_customer_id,
            amount=data.amount,
            currency=data.currency.value,
        )
    except stripe_sdk.error.StripeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    donation = Donation(
        user_id=current_user.id,
        prayer_id=prayer_uuid,
        amount=data.amount,
        currency=data.currency.value,
        donor_name=data.donor_name,
        status=DONATION_STATUS_SUCCESS,
        stripe_payment_intent_id=stripe_result["payment_intent_id"],
    )
    db.add(donation)
    db.commit()

    return QuickDonationResponse(status="success", amount=data.amount)


async def list_history(db: Session, user_uid: str):
    """TODO: SELECT * FROM donations WHERE user_id = ... ORDER BY created_at DESC."""
    raise NotImplementedError


async def create_recurring(db: Session, data, user_uid: str):
    """TODO: create_subscription + שמירת RecurringDonation."""
    raise NotImplementedError


async def cancel_recurring(db: Session, recurring_id: str, user_uid: str):
    """TODO: cancel_subscription + UPDATE recurring_donations SET is_active=False."""
    raise NotImplementedError
