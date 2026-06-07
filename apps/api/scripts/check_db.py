"""
Quick database connectivity check (Neon / Supabase / RDS / local).

Run from apps/api after creating your .env:
    python scripts/check_db.py

Prints the server version, current database, and table count. The password is masked.
"""
import asyncio
import os
import sys
from urllib.parse import urlsplit, urlunsplit

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text  # noqa: E402

import app.models  # noqa: E402,F401  (registers all tables on Base.metadata)
from app.core.config import settings  # noqa: E402
from app.core.database import make_engine  # noqa: E402


def _mask(url: str) -> str:
    p = urlsplit(url)
    if p.password:
        netloc = p.netloc.replace(f":{p.password}@", ":****@")
        p = p._replace(netloc=netloc)
    return urlunsplit(p)


async def main() -> int:
    print(f"DATABASE_URL : {_mask(settings.DATABASE_URL)}")
    engine = make_engine(echo=False)
    try:
        async with engine.connect() as conn:
            version = (await conn.execute(text("SELECT version()"))).scalar()
            db_name = (await conn.execute(text("SELECT current_database()"))).scalar()
            tables = (
                await conn.execute(
                    text(
                        "SELECT count(*) FROM information_schema.tables "
                        "WHERE table_schema = 'public'"
                    )
                )
            ).scalar()
        print("Connected OK")
        print(f"  server      : {version}")
        print(f"  database    : {db_name}")
        print(f"  public tables: {tables}")
        return 0
    except Exception as exc:  # noqa: BLE001
        print("Connection FAILED")
        print(f"  {type(exc).__name__}: {exc}")
        return 1
    finally:
        await engine.dispose()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
