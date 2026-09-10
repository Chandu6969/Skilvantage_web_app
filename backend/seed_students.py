"""Seed the student roster from the user's attendance register HTML. Idempotent by name+phone.

Usage: cd /app/backend && python seed_students.py
"""

import asyncio

from lib.db import db, ensure_indexes
from models.students import Student

# (name, year, branch, phone) — transcribed from "Skillvantage- Attendance Register.html"
STUDENTS: list[tuple[str, str, str, str]] = [
    ("Gopireddy Avinash", "4th Year B.Tech", "AI/ML", "7671874669"),
    ("Lakshmi Jyothi Donga", "4th Year B.Tech", "Data Science", "9059887884"),
    ("Boni Hemanjali", "4th Year B.Tech", "Data Science", "9398263171"),
    ("Karneedi Sai Sreehitha", "4th Year B.Tech", "AI/ML", "9157769227"),
    ("Mupparaju Lekhya Sri Lakshmi", "4th Year B.Tech", "AI/ML", "8919258590"),
    ("PadmaSai Aruna Geetha Maddukuri", "4th Year B.Tech", "AI/ML", "9381027003"),
    ("Pattapu Sri Vaishnavi Naidu", "4th Year B.Tech", "AI/ML", "9154558227"),
    ("Kallepalli Madhu Sravani", "4th Year B.Tech", "AI/ML", "9908374626"),
    ("Bodapati Pushpa Sireesha", "4th Year B.Tech", "AI/ML", "6300699967"),
    ("Gogineni Gayathri Devi", "4th Year B.Tech", "AI/ML", "8019617829"),
    ("Dhulipalla Divya", "4th Year B.Tech", "AI/ML", "8919849439"),
    ("Nandam Devi Sri Vani", "4th Year B.Tech", "AI/ML", "9346109882"),
    ("Pujita Phani Sirigina", "4th Year B.Tech", "AI/ML", "9182374544"),
    ("Divya Srija Maddala", "4th Year B.Tech", "AI/ML", "9398771574"),
    ("Kamakshi Kamarupini Pasupuleti", "4th Year B.Tech", "AI/ML", "9100702808"),
    ("Kandulapati Hemasri Malleswari", "4th Year B.Tech", "AI/ML", "7989767673"),
    ("Hani Sri Burugupalli", "4th Year B.Tech", "AI/ML", "9533697777"),
    ("Uma Reethika Chilukuri", "4th Year B.Tech", "AI/ML", "6281218773"),
    ("Pavani Kandula", "4th Year B.Tech", "AI/ML", "6309029199"),
    ("Gadi Kumari", "4th Year B.Tech", "AI/ML", "8712641582"),
    ("Reena Camen Kolakaluri", "4th Year B.Tech", "AI/ML", "7416678443"),
    ("K Tejaswani Devi", "4th Year B.Tech", "Data Science", "9542240636"),
    ("Deepika", "4th Year B.Tech", "AI/ML", "6302394045"),
    ("Rohith Katta", "3rd Year B.Tech", "AI/ML", "9912503129"),
    ("Nichenakola Anuradha", "4th Year B.Tech", "AI/ML", "9398970890"),
    ("Kunuku Swathi Tanuja", "4th Year B.Tech", "Data Science", "7032656304"),
    ("Gandham Lalitha Nagini", "4th Year B.Tech", "AI/ML", "7569542886"),
    ("Mane Nikhitha", "4th Year B.Tech", "Data Science", "8143871939"),
    ("Harshitha Chode", "", "", ""),
    ("Tammisetty Hemanth Someswara Rao", "", "", ""),
    ("Lohith Manda (3rd Year)", "3rd Year B.Tech", "", ""),
    ("Vasa Mohan Sivaganesh", "4th Year B.Tech", "AI/ML", "9032781866"),
    ("Raja Lokesh (3rd Year)", "3rd Year B.Tech", "", "8096063819"),
    ("Mandaloju Sravani", "Already Graduated", "Data Science", "9014688"),
    ("Sk Umar", "4th Year B.Tech", "AI/ML", "9494408329"),
    ("Rachapothu Venkatesh", "4th Year B.Tech", "AI/ML", "9052747929"),
    ("Guttula Hemanth Harish", "4th Year B.Tech", "AI/ML", "9014688658"),
    # Present in the student portal file but not the attendance register:
    ("Chandra Sekhar Kukkala", "4th Year B.Tech", "", "9951154173"),
]

MONTHLY_AMOUNT = 999.0


async def main() -> None:
    created = skipped = 0
    for name, year, branch, phone in STUDENTS:
        if await db.students.find_one({"full_name": name}):
            skipped += 1
            continue
        student = Student(
            full_name=name,
            year=year or None,
            branch=branch or None,
            phone=phone or None,
            monthly_amount=MONTHLY_AMOUNT,
            active=True,
        )
        await db.students.insert_one(student.model_dump())
        created += 1

    await ensure_indexes()
    total = await db.students.count_documents({})
    print(f"Students seeded: {created} created, {skipped} already present. Roster total: {total}.")


if __name__ == "__main__":
    asyncio.run(main())
