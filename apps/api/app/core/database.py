"""
Async SQLAlchemy database session — LOCAL DEMO MODE using SQLite.

Uses aiosqlite for zero-setup local development. The database file is stored
at apps/api/finpal_demo.db. Tables are auto-created on startup.

TODO: Switch back to PostgreSQL (asyncpg) for production.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def _get_database_url() -> str:
    """
    Determine the database URL. If DATABASE_URL env var points to Postgres,
    fall back to local SQLite for demo mode.
    """
    url = settings.DATABASE_URL

    # If the URL is the default Postgres or Postgres isn't reachable, use SQLite
    if "postgresql" in url or "postgres" in url:
        db_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_path = os.path.join(db_dir, "finpal_demo.db")
        return f"sqlite+aiosqlite:///{db_path}"

    return url


def make_engine(echo: bool | None = None) -> AsyncEngine:
    """Create a configured async engine."""
    url = _get_database_url()

    connect_args: dict[str, Any] = {}
    if "sqlite" in url:
        # SQLite needs check_same_thread=False for async usage
        connect_args["check_same_thread"] = False

    return create_async_engine(
        url,
        echo=settings.DEBUG if echo is None else echo,
        connect_args=connect_args,
    )


engine = make_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
