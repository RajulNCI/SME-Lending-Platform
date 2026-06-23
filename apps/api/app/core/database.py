"""
Async SQLAlchemy database session.

Connects to PostgreSQL (RDS) when DATABASE_URL is set.
Falls back to SQLite for local development without AWS.
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
    url = settings.DATABASE_URL or ""

    # Use PostgreSQL if a real URL is configured
    if "postgresql" in url or "postgres" in url:
        # Ensure asyncpg driver is used
        return url.replace("postgresql://", "postgresql+asyncpg://").replace(
            "postgres://", "postgresql+asyncpg://"
        )

    # Fallback: local SQLite (dev without AWS)
    db_dir = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    db_path = os.path.join(db_dir, "finpal_demo.db")
    return f"sqlite+aiosqlite:///{db_path}"


def make_engine(echo: bool | None = None) -> AsyncEngine:
    url = _get_database_url()
    connect_args: dict[str, Any] = {}
    if "sqlite" in url:
        connect_args["check_same_thread"] = False

    return create_async_engine(
        url,
        echo=settings.DEBUG if echo is None else echo,
        connect_args=connect_args,
        pool_pre_ping=True,
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
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
