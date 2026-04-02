import os
import time

from psycopg2 import pool
from psycopg2.extras import RealDictCursor

_connection_pool = None


def _env(*names: str, default=None):
    for name in names:
        value = os.getenv(name)
        if value not in (None, ""):
            return value
    return default


def _build_db_config() -> dict:
    """Build PostgreSQL config from AZURE_DB_* variables (with DB_* fallback)."""
    host = _env("AZURE_DB_HOST", "DB_HOST", default="mahal-db")

    return {
        "host": host,
        "database": _env("AZURE_DB_NAME", "DB_NAME"),
        "user": _env("AZURE_DB_USER", "DB_USER"),
        "password": _env("AZURE_DB_PASSWORD", "DB_PASSWORD"),
        "port": int(_env("AZURE_DB_PORT", "DB_PORT", default=5432)),
        "sslmode": _env("AZURE_DB_SSLMODE", "DB_SSLMODE", default="disable"),
        "cursor_factory": RealDictCursor,
    }


def get_connection_pool():
    global _connection_pool

    if _connection_pool is None:
        config = _build_db_config()
        print(f"🔎 Creating connection pool for {config['host']}:{config['port']}")

        retries = 3
        for attempt in range(retries):
            try:
                _connection_pool = pool.SimpleConnectionPool(1, 20, **config)
                print("✅ Connection pool created")
                break
            except Exception as error:
                print(f"❌ Pool creation failed (attempt {attempt + 1}): {error}")
                time.sleep(2)

        if _connection_pool is None:
            raise RuntimeError("Failed to create DB connection pool after retries")

    return _connection_pool


class _PooledConnectionProxy:
    def __init__(self, conn):
        self._conn = conn

    def __getattr__(self, item):
        return getattr(self._conn, item)

    def close(self):
        release_db_connection(self)


def get_db_connection():
    connection_pool = get_connection_pool()
    conn = connection_pool.getconn()
    print("📦 Connection acquired")
    return _PooledConnectionProxy(conn)


def release_db_connection(conn):
    if conn is None:
        return

    connection_pool = get_connection_pool()
    raw_conn = getattr(conn, "_conn", conn)
    connection_pool.putconn(raw_conn)
    print("🔁 Connection released")
