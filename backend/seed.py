"""Idempotent seed: the SkilVantage admin account + a few demo leads. `python seed.py`."""

import asyncio
import random
import sys
from datetime import datetime, timedelta, timezone

from lib.auth import hash_password
from lib.db import db, ensure_indexes

ADMIN_EMAIL = "admin@skilvantage.com"
ADMIN_PASSWORD = "SkilVantage@2025"

PROGRAMS = ["data-analyst", "data-scientist", "ai-ml", "generative-ai", "agentic-ai"]
STATUSES = ["New", "Contacted", "Counselling Scheduled", "Interested", "Registered", "Training Started"]

DEMO = [
    ("Ananya Iyer", "student", "data-analyst", "Chennai", "Tamil Nadu"),
    ("Rahul Menon", "professional", "generative-ai", "Bengaluru", "Karnataka"),
    ("Sneha Kulkarni", "student", "data-scientist", "Pune", "Maharashtra"),
    ("Vikram Singh", "professional", "ai-ml", "Hyderabad", "Telangana"),
    ("Priya Nair", "student", "agentic-ai", "Kochi", "Kerala"),
    ("Arjun Deshpande", "professional", "data-analyst", "Mumbai", "Maharashtra"),
    ("Meera Krishnan", "student", "generative-ai", "Coimbatore", "Tamil Nadu"),
    ("Karthik Reddy", "professional", "data-scientist", "Hyderabad", "Telangana"),
]


async def main() -> None:
    admin_only = "--admin-only" in sys.argv

    await db.admin_users.update_one(
        {"email": ADMIN_EMAIL},
        {
            "$set": {
                "email": ADMIN_EMAIL,
                "name": "SkilVantage Admin",
                "role": "admin",
                "password_hash": hash_password(ADMIN_PASSWORD),
            }
        },
        upsert=True,
    )

    if admin_only:
        await ensure_indexes()
        print(f"Seeded admin {ADMIN_EMAIL} / {ADMIN_PASSWORD} (admin only, no demo data).")
        return

    random.seed(7)
    now = datetime.now(timezone.utc)
    for i, (name, learner, program, city, state) in enumerate(DEMO):
        reg_id = f"{'SVS' if learner == 'student' else 'SVP'}25DEMO{i:02d}"
        doc = {
            "id": reg_id,
            "registration_id": reg_id,
            "learner_type": learner,
            "program": program,
            "full_name": name,
            "email": f"{name.split()[0].lower()}@example.com",
            "phone": f"98{random.randint(10000000, 99999999)}",
            "city": city,
            "state": state,
            "learning_mode": random.choice(["Online", "Hybrid", "Offline"]),
            "consent": True,
            "created_at": now - timedelta(days=i, hours=i * 2),
            "status": STATUSES[i % len(STATUSES)],
            "notes": "",
            "follow_up_date": None,
        }
        if learner == "student":
            doc.update(
                {
                    "college": "Anna University",
                    "degree": "B.E.",
                    "branch": "Computer Science",
                    "passed_out_year": "2025",
                    "looking_for": "Both",
                    "source": "Instagram",
                }
            )
        else:
            doc.update(
                {
                    "current_company": "Infosys",
                    "current_role": "Software Engineer",
                    "experience_years": str(2 + i),
                    "industry": "IT Services",
                    "notice_period": "60 days",
                }
            )
        await db.registrations.update_one({"registration_id": reg_id}, {"$set": doc}, upsert=True)

    await db.enquiries.update_one(
        {"email": "enquiry@example.com"},
        {
            "$set": {
                "id": "demo-enquiry-1",
                "name": "Divya Raman",
                "email": "enquiry@example.com",
                "phone": "9876543210",
                "program": "data-analyst",
                "learner_type": "student",
                "message": "Please share batch timings and fee details.",
                "created_at": now - timedelta(days=1),
                "status": "New",
            }
        },
        upsert=True,
    )

    await ensure_indexes()
    print(f"Seeded admin {ADMIN_EMAIL} / {ADMIN_PASSWORD} and {len(DEMO)} demo leads.")


if __name__ == "__main__":
    asyncio.run(main())
