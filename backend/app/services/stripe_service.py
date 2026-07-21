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


async def create_donation_payment_intent(
    amount: int, currency: str, customer_id: str | None = None
):
    params = {
        "amount": amount,
        "currency": currency.lower(),
        "automatic_payment_methods": {"enabled": True},
        "setup_future_usage": "off_session",
    }
    if customer_id:
        params["customer"] = customer_id

    intent = await asyncio.to_thread(stripe.PaymentIntent.create, **params)

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
    }


async def create_or_get_customer(existing_customer_id: str | None, email: str):
    if existing_customer_id:
        customer = await asyncio.to_thread(stripe.Customer.retrieve, existing_customer_id)
    else:
        customer = await asyncio.to_thread(stripe.Customer.create, email=email)

    return {"customer_id": customer.id}


async def get_payment_method_from_intent(payment_intent_id: str):
    intent = await asyncio.to_thread(stripe.PaymentIntent.retrieve, payment_intent_id)
    return {"payment_method_id": intent.payment_method}


async def attach_payment_method(payment_method_id: str, customer_id: str) -> dict:
    payment_method = await asyncio.to_thread(
        stripe.PaymentMethod.attach,
        payment_method_id,
        customer=customer_id,
    )

    await asyncio.to_thread(
        stripe.Customer.modify,
        customer_id,
        invoice_settings={"default_payment_method": payment_method_id},
    )

    return {
        "last4": payment_method.card.last4,
        "brand": payment_method.card.brand,
    }


async def get_default_payment_method(customer_id: str):
    customer = await asyncio.to_thread(stripe.Customer.retrieve, customer_id)
    return {"payment_method_id": customer.invoice_settings.default_payment_method}


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
    """stripe.PaymentMethod.detach(...) — מחיקת כרטיס שמור."""
    await asyncio.to_thread(stripe.PaymentMethod.detach, payment_method_id)


def construct_webhook_event(payload: bytes, sig_header: str):
    return stripe.Webhook.construct_event(
        payload=payload,
        sig_header=sig_header,
        secret=settings.STRIPE_WEBHOOK_SECRET,
    )
