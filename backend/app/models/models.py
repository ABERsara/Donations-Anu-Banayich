"""
SQLAlchemy Models — מבנה הטבלאות ב-DB (לפי ה-ERD באפיון).
השדות הרב-לשוניים מוגדרים כ-nullable כ-stub; להשלים/לחדד לפני ה-migration הראשון.
TODO: alembic revision --autogenerate לאחר השלמת השדות.
"""

import uuid

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.sql import func

from app.database import Base


class Prayer(Base):
    __tablename__ = "prayers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)

    # ─── כותרות רב-לשוניות ───────────────────────────────────
    title_he = Column(String, nullable=True)
    title_en = Column(String, nullable=True)
    title_fr = Column(String, nullable=True)
    title_ru = Column(String, nullable=True)
    title_es = Column(String, nullable=True)
    title_ar = Column(String, nullable=True)

    # ─── גוף התפילה רב-לשוני ─────────────────────────────────
    body_he = Column(Text, nullable=True)
    body_en = Column(Text, nullable=True)
    body_fr = Column(Text, nullable=True)
    body_ru = Column(Text, nullable=True)
    body_es = Column(Text, nullable=True)
    body_ar = Column(Text, nullable=True)

    # ─── SEO ─────────────────────────────────────────────────
    seo_keywords_he = Column(ARRAY(String), nullable=True)
    seo_keywords_en = Column(ARRAY(String), nullable=True)
    seo_description_he = Column(Text, nullable=True)
    seo_description_en = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    preferred_lang = Column(String(5), default="he")
    preferred_currency = Column(String(3), default="ILS")
    stripe_customer_id = Column(String, nullable=True)
    saved_card_last4 = Column(String(4), nullable=True)  # תצוגה בלבד!
    saved_card_brand = Column(String, nullable=True)
    has_saved_card = Column(Boolean, default=False)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class Donation(Base):
    __tablename__ = "donations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    prayer_id = Column(UUID(as_uuid=True), ForeignKey("prayers.id"), nullable=False)
    quick_button_id = Column(UUID(as_uuid=True), ForeignKey("quick_buttons.id"), nullable=True)
    amount = Column(Integer, nullable=False)  # סנטים/אגורות
    currency = Column(String(3), default="ILS")
    stripe_payment_intent_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending|success|failed|refunded
    donor_name = Column(String, nullable=False)
    prayer_name = Column(String, nullable=True)
    donor_note = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    receipt_email = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())


class RecurringDonation(Base):
    __tablename__ = "recurring_donations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    prayer_id = Column(UUID(as_uuid=True), ForeignKey("prayers.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    currency = Column(String(3), default="ILS")
    stripe_subscription_id = Column(String, nullable=True)
    day_of_month = Column(Integer, nullable=True)  # יום החיוב החודשי
    is_active = Column(Boolean, default=True)
    next_charge_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())


class QuickButton(Base):
    __tablename__ = "quick_buttons"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    prayer_id = Column(UUID(as_uuid=True), ForeignKey("prayers.id"))
    label_he = Column(String, nullable=True)
    label_en = Column(String, nullable=True)
    label_fr = Column(String, nullable=True)
    label_ru = Column(String, nullable=True)
    label_es = Column(String, nullable=True)
    label_ar = Column(String, nullable=True)
    default_amount_ils = Column(Integer, default=7200)
    default_amount_usd = Column(Integer, default=1800)
    icon = Column(String, nullable=True)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, nullable=False)
    name_he = Column(String, nullable=True)
    name_en = Column(String, nullable=True)
    name_fr = Column(String, nullable=True)
    name_ru = Column(String, nullable=True)
    name_es = Column(String, nullable=True)
    name_ar = Column(String, nullable=True)
    icon_url = Column(String, nullable=True)
    order = Column(Integer, default=0)
