"""
TODO: Users Router
GET    /api/users/me      — פרופיל
PATCH  /api/users/me      — עדכון שפה/מטבע
DELETE /api/users/me/card — מחיקת כרטיס שמור
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.models import User
from app.schemas.schemas import UserResponse, UserUpdate
from app.services.user_service import remove_saved_card, update_preferences

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    body: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    user = update_preferences(
        db,
        firebase_uid=current_user.firebase_uid,
        lang=body.preferred_lang,
        currency=body.preferred_currency,
    )
    return user


@router.delete("/me/card", response_model=UserResponse)
async def delete_card(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    user = await remove_saved_card(db, firebase_uid=current_user.firebase_uid)
    return user
