"""
TODO: Users Router
GET    /api/users/me      — פרופיל
PATCH  /api/users/me      — עדכון שפה/מטבע
DELETE /api/users/me/card — מחיקת כרטיס שמור
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import verify_firebase_token

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me")
def get_me(uid=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    # TODO: SELECT * FROM users WHERE firebase_uid = uid
    raise NotImplementedError


@router.patch("/me")
def update_me(body: dict, uid=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    # TODO: UPDATE users SET preferred_lang/currency WHERE firebase_uid = uid
    raise NotImplementedError


@router.delete("/me/card")
def delete_card(uid=Depends(verify_firebase_token), db: Session = Depends(get_db)):
    # TODO:
    # 1. stripe.PaymentMethod.detach(payment_method_id)
    # 2. UPDATE users SET has_saved_card=False, saved_card_last4=None
    raise NotImplementedError
