"""Shared Mongo handle — import `client`/`db` from here (server.py, routers, seed.py)."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, IndexModel

load_dotenv(Path(__file__).parent.parent / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

logger = logging.getLogger(__name__)

# One entry per collection: every field a route filters, sorts, or dedupes on. Applied by ensure_indexes() at startup.
INDEXES: dict[str, list[IndexModel]] = {
    "status_checks": [IndexModel([("timestamp", DESCENDING)], name="timestamp_desc")],
    "registrations": [
        IndexModel([("registration_id", ASCENDING)], name="registration_id", unique=True),
        IndexModel([("created_at", DESCENDING)], name="created_desc"),
        IndexModel([("program", ASCENDING), ("created_at", DESCENDING)], name="program_created"),
        IndexModel([("learner_type", ASCENDING), ("created_at", DESCENDING)], name="learner_created"),
        IndexModel([("status", ASCENDING)], name="status"),
        IndexModel([("email", ASCENDING)], name="email"),
        IndexModel([("follow_up_date", ASCENDING)], name="follow_up_date"),
        IndexModel([("batch_id", ASCENDING)], name="batch_id"),
    ],
    "enquiries": [IndexModel([("created_at", DESCENDING)], name="created_desc")],
    "admin_users": [IndexModel([("email", ASCENDING)], name="email", unique=True)],
    "admin_sessions": [
        IndexModel([("token", ASCENDING)], name="token", unique=True),
        IndexModel([("expires_at", ASCENDING)], name="ttl", expireAfterSeconds=0),
    ],
    "resumes": [IndexModel([("file_id", ASCENDING)], name="file_id", unique=True)],
    "batches": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("program", ASCENDING), ("start_date", ASCENDING)], name="program_start"),
        IndexModel([("start_date", ASCENDING)], name="start_date"),
    ],
    "students": [
        IndexModel([("learner_type", ASCENDING), ("active", ASCENDING)], name="type_active"),
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("full_name", ASCENDING)], name="full_name"),
        IndexModel([("active", ASCENDING), ("full_name", ASCENDING)], name="active_name"),
    ],
    "attendance": [
        IndexModel([("date", ASCENDING), ("student_id", ASCENDING)], name="date_student", unique=True),
        IndexModel([("date", ASCENDING)], name="date"),
        IndexModel([("student_id", ASCENDING)], name="student"),
    ],
    "payments": [
        IndexModel([("student_id", ASCENDING), ("month", ASCENDING)], name="student_month", unique=True),
        IndexModel([("month", ASCENDING)], name="month"),
        IndexModel([("paid", ASCENDING)], name="paid"),
    ],
    "holidays": [
        IndexModel([("date", ASCENDING)], name="date", unique=True),
        IndexModel([("id", ASCENDING)], name="id", unique=True),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:  # one at a time so a bad spec skips only itself
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:  # never block boot on an index; the log line names what to fix
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)
