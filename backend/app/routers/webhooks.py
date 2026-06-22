"""
TODO: Stripe Webhook
POST /api/webhooks/stripe

חשוב: לאמת חתימה עם STRIPE_WEBHOOK_SECRET לפני עיבוד!
אירועים לטפל:
  - payment_intent.succeeded  → UPDATE donations SET status='success'
  - payment_intent.payment_failed → UPDATE status='failed'
  - customer.subscription.deleted → UPDATE recurring_donations SET is_active=False
"""

from fastapi import APIRouter, Request

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # TODO:
    # event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    # if event["type"] == "payment_intent.succeeded": ...

    return {"received": True}
