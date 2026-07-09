"""
שירות Stripe — כל הקריאות ל-Stripe API מרוכזות כאן.
ה-routers לא מדברים ישירות עם Stripe, אלא דרך הפונקציות האלה (SRP).

TODO (צוות הפרקטיקום): לממש מול ה-SDK (stripe==15.x) ו-settings.STRIPE_SECRET_KEY.
"""

import asyncio

import stripe

from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_payment_intent(amount: int, currency: str, customer_id: str | None = None):
    params = {
        "amount": amount,
        "currency": currency.lower(),
        "automatic_payment_methods": {"enabled": True},
    }
    if customer_id:
        params["customer"] = customer_id

    intent = await asyncio.to_thread(stripe.PaymentIntent.create, **params)

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
    }


async def charge_saved_card(customer_id: str, amount: int, currency: str):
    """TODO: חיוב מיידי על payment_method שמור (Quick donation)."""
    raise NotImplementedError


async def create_subscription(customer_id: str, amount: int, currency: str, day_of_month: int):
    """TODO: stripe.Subscription.create(...) — תרומה חוזרת."""
    raise NotImplementedError


async def cancel_subscription(subscription_id: str):
    """TODO: stripe.Subscription.delete(...)."""
    raise NotImplementedError


async def detach_payment_method(payment_method_id: str):
    """TODO: stripe.PaymentMethod.detach(...) — מחיקת כרטיס שמור."""
    raise NotImplementedError


def construct_webhook_event(payload: bytes, sig_header: str):
    return stripe.Webhook.construct_event(
        payload=payload,
        sig_header=sig_header,
        secret=settings.STRIPE_WEBHOOK_SECRET,
    )
