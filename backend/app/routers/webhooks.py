"""
TODO: Stripe Webhook
POST /api/webhooks/stripe

חשוב: לאמת חתימה עם STRIPE_WEBHOOK_SECRET לפני עיבוד!
אירועים לטפל:
  - payment_intent.succeeded  → UPDATE donations SET status='success'
  - payment_intent.payment_failed → UPDATE status='failed'
  - customer.subscription.deleted → UPDATE recurring_donations SET is_active=False
"""

import logging

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import donation_service, stripe_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload") from e
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature") from e
    if event["type"] == "payment_intent.succeeded":
        payment_intent_id = event["data"]["object"]["id"]
        try:
            await donation_service.confirm_donation(db, payment_intent_id)
        except HTTPException as e:
            if e.status_code == 404:
                logger.warning(f"Donation not found for payment_intent_id={payment_intent_id}")
            else:
                raise
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent_id = event["data"]["object"]["id"]
        try:
            await donation_service.fail_donation(db, payment_intent_id)
        except HTTPException as e:
            if e.status_code == 404:
                logger.warning(f"Donation not found for payment_intent_id={payment_intent_id}")
            else:
                raise

    return {"received": True}
