"""Admin session auth — httpOnly cookie backed by a Mongo sessions collection."""

import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Cookie, HTTPException

from lib.db import db

SESSION_COOKIE = "sv_session"
SESSION_DAYS = 7


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
    return f"{salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, _ = stored.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(hash_password(password, salt), stored)


async def create_session(email: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.admin_sessions.insert_one(
        {
            "token": token,
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        }
    )
    return token


async def destroy_session(token: str) -> None:
    await db.admin_sessions.delete_one({"token": token})


async def current_admin(sv_session: Optional[str] = Cookie(default=None)) -> dict:
    if not sv_session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.admin_sessions.find_one({"token": sv_session})
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")
    expires = session["expires_at"]
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.admin_users.find_one({"email": session["email"]})
    if not user:
        raise HTTPException(status_code=401, detail="Unknown admin")
    return user


COOKIE_KWARGS = dict(
    httponly=True,
    samesite="lax",
    secure=os.environ.get("APP_URL", "").startswith("https"),
    path="/",
    max_age=SESSION_DAYS * 24 * 3600,
)
