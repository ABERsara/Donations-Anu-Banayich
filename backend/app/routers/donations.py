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
from app.middleware.auth import get_current_user, optional_firebase_token
from app.schemas.schemas import (
    DonationConfirm,
    DonationCreate,
    DonationResponse,
    RecurringDonationCreate,
    RecurringDonationResponse,
)
from app.services import donation_service

router = APIRouter(prefix="/api/donations", tags=["donations"])


@router.post("/initiate", response_model=DonationResponse)
async def initiate_donation(
    body: DonationCreate,
    current_user=Depends(optional_firebase_token),
    db: Session = Depends(get_db),
):
    return await donation_service.create_pending_donation(db, body, current_user)


@router.post("/confirm")
async def confirm_donation(
    body: DonationConfirm,
    current_user=Depends(optional_firebase_token),
    db: Session = Depends(get_db),
):
    return await donation_service.confirm_donation(db, body.payment_intent_id)


@router.post("/quick")
async def quick_donate(
    body: DonationCreate,
    current_user=Depends(get_current_user),  # חובה — צריך כרטיס שמור
    db: Session = Depends(get_db),
):
    # TODO: donation_service.quick_donation(db, body, current_user)
    raise NotImplementedError


@router.post("/recurring", response_model=RecurringDonationResponse)
async def create_recurring_donation(
    body: RecurringDonationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.create_recurring(db, body, current_user)
    raise NotImplementedError


@router.get("/history")
def donation_history(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    # TODO: donation_service.list_history(db, current_user)
    return []


@router.delete("/recurring/{recurring_id}")
def cancel_recurring_donation(
    recurring_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # TODO: donation_service.cancel_recurring(db, recurring_id, current_user)
    raise NotImplementedError
