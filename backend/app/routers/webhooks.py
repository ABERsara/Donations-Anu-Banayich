"""
Stripe Webhook handler.
POST /api/webhooks/stripe

מאמת את חתימת Stripe לפני כל עיבוד, ומטפל בשלושה סוגי אירועים:
  - payment_intent.succeeded       → donations.status = 'success'
  - payment_intent.payment_failed  → donations.status = 'failed'
  - customer.subscription.deleted  → recurring_donations.is_active = False
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
                logger.warning("Donation not found for payment_intent_id=%s", payment_intent_id)
            else:
                raise
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent_id = event["data"]["object"]["id"]
        try:
            await donation_service.fail_donation(db, payment_intent_id)
        except HTTPException as e:
            if e.status_code == 404:
                logger.warning("Donation not found for payment_intent_id=%s", payment_intent_id)
            else:
                raise
    elif event["type"] == "customer.subscription.deleted":
        subscription_id = event["data"]["object"]["id"]
        try:
            await donation_service.deactivate_recurring_donation(db, subscription_id)
        except HTTPException as e:
            if e.status_code == 404:
                logger.warning(
                    "Recurring donation not found for subscription_id=%s", subscription_id
                )
            else:
                raise

    return {"received": True}
