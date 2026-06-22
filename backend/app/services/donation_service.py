"""
שירות תרומות — לוגיקה עסקית לתרומות חד-פעמיות וחוזרות.
משלב בין ה-DB (Donation / RecurringDonation) ל-stripe_service.

TODO (צוות הפרקטיקום): לממש.
"""

from sqlalchemy.orm import Session


def create_pending_donation(db: Session, data, user_uid: str | None = None):
    """TODO: create_payment_intent + שמירת Donation עם status=pending → client_secret."""
    raise NotImplementedError


def confirm_donation(db: Session, payment_intent_id: str):
    """TODO: עדכון Donation ל-status=success לאחר אישור תשלום."""
    raise NotImplementedError


def quick_donation(db: Session, data, user_uid: str):
    """TODO: charge_saved_card למשתמש עם כרטיס שמור (2 קליקים)."""
    raise NotImplementedError


def list_history(db: Session, user_uid: str):
    """TODO: SELECT * FROM donations WHERE user_id = ... ORDER BY created_at DESC."""
    raise NotImplementedError


def create_recurring(db: Session, data, user_uid: str):
    """TODO: create_subscription + שמירת RecurringDonation."""
    raise NotImplementedError


def cancel_recurring(db: Session, recurring_id: str, user_uid: str):
    """TODO: cancel_subscription + UPDATE recurring_donations SET is_active=False."""
    raise NotImplementedError
