"""
Firebase Token Verification Middleware
TODO: לאתחל firebase-admin ב-main.py לפני שימוש
"""

from fastapi import Depends, Header, HTTPException, status
from firebase_admin import auth as firebase_auth
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import user_service


async def verify_firebase_token(
    authorization: str = Header(default=""), db: Session = Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    token = authorization.split("Bearer ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        ) from e
    uid = decoded_token["uid"]
    email = decoded_token.get("email")
    user = user_service.get_or_create_user(db, uid, email)
    return user


async def optional_firebase_token(
    authorization: str = Header(default=""), db: Session = Depends(get_db)
):
    if not authorization:
        return None

    try:
        return await verify_firebase_token(authorization=authorization, db=db)
    except HTTPException:
        return None
