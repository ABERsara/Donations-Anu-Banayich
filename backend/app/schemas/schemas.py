"""
Pydantic Schemas — validation של request/response.
ה-schemas הרב-לשוניים מוגדרים כ-stub; להשלים לפי ה-ERD ומיפוי לשפה.
"""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel


class Currency(str, Enum):
    ILS = "ILS"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    ARS = "ARS"


# ─── Donation ────────────────────────────────────────────────
class DonationCreate(BaseModel):
    prayer_id: str
    amount: int = Field(gt=0)  # סנטים/אגורות
    currency: Currency
    donor_name: str = Field(min_length=2)
    prayer_name: str | None = None
    donor_note: str | None = None
    save_card: bool = False
    quick_button_slug: str | None = None
    receipt_email: EmailStr | None = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class DonationResponse(BaseModel):
    client_secret: str = Field(alias="clientSecret")
    payment_intent_id: str = Field(alias="paymentIntentId")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=True)


class QuickDonationCreate(BaseModel):
    prayer_id: str
    amount: int = Field(gt=0)
    currency: Currency
    donor_name: str = Field(min_length=2)


class QuickDonationResponse(BaseModel):
    status: str
    amount: int


class DonationConfirm(BaseModel):
    payment_intent_id: str
    save_card: bool = False

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# ─── Recurring Donation ──────────────────────────────────────
class RecurringDonationCreate(BaseModel):
    prayer_id: str
    amount: int
    currency: Currency
    day_of_month: int | None = None
    donor_name: str


class RecurringDonationResponse(BaseModel):
    id: str
    stripe_subscription_id: str | None = Field(None, alias="stripeSubscriptionId")
    is_active: bool = Field(alias="isActive")
    next_charge_at: str | None = Field(None, alias="nextChargeAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=True)


class DonationHistoryItem(BaseModel):
    id: UUID
    amount: int
    currency: str
    status: str
    prayer_name: str | None = Field(None, alias="prayerName")
    donor_name: str = Field(alias="donorName")
    created_at: datetime = Field(alias="createdAt")
    donor_note: str | None = Field(None, alias="donorNote")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=True)


# ─── Prayer ──────────────────────────────────────────────────
class PrayerResponse(BaseModel):
    """תפילה ממופה לשפה אחת (title/body/seo לפי lang)."""

    id: str
    slug: str
    title: str
    body: str
    seo_description: str | None = Field(None, alias="seoDescription")
    seo_keywords: list[str] = Field(default=[], alias="seoKeywords")
    lang: str
    category_id: str | None = Field(None, alias="categoryId")
    view_count: int

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=True)


# ─── User ────────────────────────────────────────────────────
class UserResponse(BaseModel):
    id: UUID
    firebase_uid: str = Field(alias="firebaseUid")
    email: EmailStr | None = None
    display_name: str | None = Field(None, alias="displayName")
    preferred_lang: str = Field(default="he", alias="preferredLang")
    preferred_currency: str = Field(default="ILS", alias="preferredCurrency")
    stripe_customer_id: str | None = Field(None, alias="stripeCustomerId")
    has_saved_card: bool = Field(default=False, alias="hasSavedCard")
    saved_card_last4: str | None = Field(None, alias="savedCardLast4")
    saved_card_brand: str | None = Field(None, alias="savedCardBrand")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, by_alias=True)


class UserUpdate(BaseModel):
    """PATCH /api/users/me — עדכון העדפות."""

    preferred_lang: str | None = None
    preferred_currency: str | None = None
    display_name: str | None = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
