"""
Firebase Token Verification Middleware
TODO: לאתחל firebase-admin ב-main.py לפני שימוש
"""

from fastapi import Header, HTTPException, status

# import firebase_admin
# from firebase_admin import auth as firebase_auth


async def verify_firebase_token(authorization: str = Header(...)):
    """
    Dependency — מאמתת Bearer token מ-Firebase.
    שימוש: user = Depends(verify_firebase_token)

    TODO:
    1. חלץ token מ-"Bearer <token>"
    2. firebase_auth.verify_id_token(token)
    3. החזר uid
    """
    # TODO: לממש
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    # token = authorization.split("Bearer ")[1]
    # decoded = firebase_auth.verify_id_token(token)
    # return decoded["uid"]
    raise HTTPException(status_code=501, detail="Auth not implemented yet")


async def optional_firebase_token(authorization: str = Header(default="")):
    """כמו verify_firebase_token אבל מחזיר None אם אין token (ל-anonymous donations)"""
    # TODO: לממש
    return None
