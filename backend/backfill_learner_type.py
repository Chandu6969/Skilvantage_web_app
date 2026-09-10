"""Backfill: every pre-existing roster row is a student. Idempotent."""

import asyncio

from lib.db import db, ensure_indexes


async def main() -> None:
    result = await db.students.update_many(
        {"learner_type": {"$exists": False}}, {"$set": {"learner_type": "student"}}
    )
    await ensure_indexes()
    students = await db.students.count_documents({"learner_type": "student"})
    pros = await db.students.count_documents({"learner_type": "professional"})
    print(f"Backfilled {result.modified_count} rows. Students: {students}, professionals: {pros}.")


if __name__ == "__main__":
    asyncio.run(main())
