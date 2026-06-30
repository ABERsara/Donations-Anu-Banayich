"""
Pydantic Schemas — validation של request/response.
ה-schemas הרב-לשוניים מוגדרים כ-stub; להשלים לפי ה-ERD ומיפוי לשפה.
"""

from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr


class Currency(str, Enum):
    ILS = "ILS"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    ARS = "ARS"


# ─── Donation ────────────────────────────────────────────────
class DonationCreate(BaseModel):
    prayer_id: str
    amount: int  # סנטים/אגורות
    currency: Currency
    donor_name: str
    prayer_name: str | None = None
    donor_note: str | None = None
    save_card: bool = False
    quick_button_slug: str | None = None
    receipt_email: EmailStr | None = None


class DonationResponse(BaseModel):
    client_secret: str
    payment_intent_id: str


class DonationConfirm(BaseModel):
    payment_intent_id: str


# ─── Recurring Donation ──────────────────────────────────────
class RecurringDonationCreate(BaseModel):
    prayer_id: str
    amount: int
    currency: Currency
    day_of_month: int | None = None
    donor_name: str


class RecurringDonationResponse(BaseModel):
    id: str
    stripe_subscription_id: str | None = None
    is_active: bool
    next_charge_at: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ─── Prayer ──────────────────────────────────────────────────
class PrayerResponse(BaseModel):
    """תפילה ממופה לשפה אחת (title/body/seo לפי lang)."""

    id: str
    slug: str
    # TODO: למפות לפי שפה — title, body, seo_keywords, seo_description
    title: str | None = None
    body: str | None = None

    model_config = ConfigDict(from_attributes=True)


# ─── User ────────────────────────────────────────────────────
class UserResponse(BaseModel):
    id: str
    firebase_uid: str
    email: EmailStr | None = None
    display_name: str | None = None
    preferred_lang: str = "he"
    preferred_currency: str = "ILS"
    has_saved_card: bool = False
    saved_card_last4: str | None = None
    saved_card_brand: str | None = None

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """PATCH /api/users/me — עדכון העדפות."""

    preferred_lang: str | None = None
    preferred_currency: str | None = None
