import os
import time

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor

_connection_pool = None

# Required environment variables for Azure Hybrid Connection:
#   AZURE_DB_HOST=mahal-db
#   AZURE_DB_PORT=5432
#   AZURE_DB_NAME=MAHALDATABASE
#   AZURE_DB_USER=postgres
#   AZURE_DB_PASSWORD=Aparna18
#   AZURE_DB_SSLMODE=disable
#
# Optional fallback variables:
#   DB_HOST
#   DB_PORT
#   DB_NAME
#   DB_USER
#   DB_PASSWORD
#   DB_SSLMODE


def _env(*names: str, default=None):
    for name in names:
        value = os.getenv(name)
        if value not in (None, ""):
            return value
    return default


class LoggingRealDictCursor(RealDictCursor):
    def execute(self, query, vars=None):
        print("⏳ About to execute DB query")
        result = super().execute(query, vars)
        print("✅ Query executed")
        return result

    def executemany(self, query, vars_list):
        print("⏳ About to execute DB query batch")
        result = super().executemany(query, vars_list)
        print("✅ Query executed")
        return result


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
        "connect_timeout": int(_env("AZURE_DB_CONNECT_TIMEOUT", default=5)),
        "options": f"-c statement_timeout={int(_env('AZURE_DB_STATEMENT_TIMEOUT_MS', default=15000))}",
        "cursor_factory": LoggingRealDictCursor,
    }


def get_connection_pool():
    global _connection_pool

    if _connection_pool is None:
        config = _build_db_config()

        print(f"🔎 Creating connection pool for {config['host']}:{config['port']}")

        retries = 3
        for attempt in range(retries):
            try:
                # Ensure network failures fail quickly.
                config["connect_timeout"] = int(config.get("connect_timeout", 5))

                _connection_pool = pool.SimpleConnectionPool(1, 20, **config)
                print("✅ Connection pool created")
                break

            except Exception as e:
                print(f"❌ Pool creation failed (attempt {attempt + 1}): {e}")
                time.sleep(2)

        if _connection_pool is None:
            raise RuntimeError("❌ Failed to create DB pool after retries")

    return _connection_pool


class ConnectionWrapper:
    def __init__(self, conn, connection_pool):
        self._conn = conn
        self._pool = connection_pool

    def __getattr__(self, name):
        return getattr(self._conn, name)

    def close(self):
        print("🔁 Returning connection to pool")
        self._pool.putconn(self._conn)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()
        return False


def get_db_connection():
    connection_pool = get_connection_pool()

    try:
        print("⏳ About to connect to DB")
        conn = connection_pool.getconn()
        print("📦 Connection acquired")
        return ConnectionWrapper(conn, connection_pool)
    except Exception as e:
        print(f"❌ Failed to acquire connection: {e}")
        raise


def release_db_connection(conn):
    if conn is None:
        return

    connection_pool = get_connection_pool()
    raw_conn = getattr(conn, "_conn", conn)
    print("🔁 Returning connection to pool")
    connection_pool.putconn(raw_conn)
