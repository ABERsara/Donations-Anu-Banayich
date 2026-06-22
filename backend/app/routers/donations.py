"""
Donations Router — endpoints בלבד. הלוגיקה ב-services/donation_service.py.

POST   /api/donations/initiate        — יוצר Payment Intent
POST   /api/donations/confirm         — מאשר תשלום + שומר ב-DB
POST   /api/donations/quick           — חיוב כרטיס שמור (Auth Required)
POST   /api/donations/recurring       — יצירת תרומה חוזרת (Auth Required)
GET    /api/donations/history         — היסטוריה (Auth Required)
DELETE /api/donations/recurring/{id}  — ביטול תרומה חוזרת (Auth Required)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import optional_firebase_token, verify_firebase_token
from app.schemas.schemas import (
    DonationConfirm,
    DonationCreate,
    DonationResponse,
    RecurringDonationCreate,
    RecurringDonationResponse,
)

router = APIRouter(prefix="/api/donations", tags=["donations"])


@router.post("/initiate", response_model=DonationResponse)
async def initiate_donation(
    body: DonationCreate,
    uid=Depends(optional_firebase_token),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.create_pending_donation(db, body, uid)
    raise NotImplementedError


@router.post("/confirm")
async def confirm_donation(
    body: DonationConfirm,
    uid=Depends(optional_firebase_token),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.confirm_donation(db, body.payment_intent_id)
    raise NotImplementedError


@router.post("/quick")
async def quick_donate(
    body: DonationCreate,
    uid=Depends(verify_firebase_token),  # חובה — צריך כרטיס שמור
    db: Session = Depends(get_db),
):
    # TODO: donation_service.quick_donation(db, body, uid)
    raise NotImplementedError


@router.post("/recurring", response_model=RecurringDonationResponse)
async def create_recurring_donation(
    body: RecurringDonationCreate,
    uid=Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.create_recurring(db, body, uid)
    raise NotImplementedError


@router.get("/history")
def donation_history(uid=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    # TODO: donation_service.list_history(db, uid)
    return []


@router.delete("/recurring/{recurring_id}")
def cancel_recurring_donation(
    recurring_id: str,
    uid=Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.cancel_recurring(db, recurring_id, uid)
    raise NotImplementedError
