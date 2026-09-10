"""Read straight from Atlas (bypassing the API) to prove where the data actually lives."""

import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


async def main() -> None:
    uri = os.environ["MONGO_URL"]
    name = os.environ["DB_NAME"]
    print("cluster:", uri.split("@")[-1].split("/")[0])
    print("database:", name)
    db = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=20000)[name]

    print("collections:", sorted(await db.list_collection_names()))
    for coll in ("registrations", "admin_users", "enquiries", "batches"):
        print(f"  {coll}: {await db[coll].count_documents({})} docs")

    print("\nadmin accounts:")
    async for u in db.admin_users.find({}, {"_id": 0, "email": 1, "name": 1, "role": 1}):
        print("  ", u)

    print("\nregistrations stored in Atlas:")
    async for r in db.registrations.find(
        {}, {"_id": 0, "registration_id": 1, "full_name": 1, "program": 1, "learner_type": 1, "email": 1}
    ):
        print("  ", r)


if __name__ == "__main__":
    asyncio.run(main())
