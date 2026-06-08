"""
Async SQLAlchemy database session — one session per request.

The engine is built by `make_engine()`, which normalizes the connection URL so it works
both locally and against managed Postgres (e.g. Neon / Supabase / AWS RDS):

  * forces the async driver (`postgresql+asyncpg`),
  * strips libpq-only query params (`sslmode`, `channel_binding`) asyncpg cannot parse,
  * enables TLS for any non-local host via an SSL context in `connect_args`,
  * disables prepared-statement caching for connection-pooler (PgBouncer) safety.

So you can paste a managed-Postgres connection string verbatim into DATABASE_URL.
"""

import ssl
from collections.abc import AsyncGenerator
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

_LOCAL_HOSTS = {"localhost", "127.0.0.1", "::1", ""}


def _prepare_url_and_args(raw_url: str) -> tuple[str, dict[str, Any], bool]:
    """Return (clean_async_url, connect_args, is_local) from a raw DATABASE_URL."""
    parts = urlsplit(raw_url)

    # 1) force the async driver so a pasted "postgresql://" still works
    scheme = parts.scheme
    if scheme in ("postgres", "postgresql"):
        scheme = "postgresql+asyncpg"

    host = (parts.hostname or "").lower()
    is_local = host in _LOCAL_HOSTS

    # 2) drop query params asyncpg can't understand; remember SSL intent
    query = dict(parse_qsl(parts.query))
    sslmode = query.pop("sslmode", None)
    query.pop("channel_binding", None)

    connect_args: dict[str, Any] = {}
    if not is_local and sslmode != "disable":
        # 3) managed Postgres requires TLS — pass an SSL context to asyncpg
        connect_args["ssl"] = ssl.create_default_context()
        # 4) pooler (PgBouncer transaction mode) safety
        connect_args["statement_cache_size"] = 0
        query["prepared_statement_cache_size"] = "0"

    clean_url = urlunsplit(
        (scheme, parts.netloc, parts.path, urlencode(query), parts.fragment)
    )
    return clean_url, connect_args, is_local


def make_engine(echo: bool | None = None) -> AsyncEngine:
    """Create a configured async engine from settings.DATABASE_URL."""
    url, connect_args, _is_local = _prepare_url_and_args(settings.DATABASE_URL)
    return create_async_engine(
        url,
        echo=settings.DEBUG if echo is None else echo,
        pool_pre_ping=True,  # transparently replace dropped (idle) connections
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,  # Neon free tier suspends when idle — recycle proactively
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
