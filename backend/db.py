import os

import psycopg2
from psycopg2.extras import RealDictCursor


HYBRID_LOCAL_HOSTS = {"localhost", "127.0.0.1"}
SERVICEBUS_SUFFIX = ".servicebus.windows.net"


def _env(*names: str, default=None):
    for name in names:
        value = os.getenv(name)
        if value not in (None, ""):
            return value
    return default


def _build_azure_db_config() -> dict:
    host = _env("DB_HOST", "AZURE_DB_HOST")
    if host is None:
        raise RuntimeError("FATAL: DB_HOST/AZURE_DB_HOST not found in environment!")

    normalized_host = host.strip().lower()
    if normalized_host in HYBRID_LOCAL_HOSTS:
        raise ValueError(
            "Hybrid Connections require the Hybrid Connection hostname (for example: postgres-demo), "
            "not localhost/127.0.0.1."
        )
    if normalized_host.endswith(SERVICEBUS_SUFFIX):
        raise ValueError(
            "Use Hybrid Connection name as DB host (for example: postgres-demo), "
            "not the *.servicebus.windows.net relay endpoint."
        )

    return {
        "host": host,
        "database": _env("DB_NAME", "AZURE_DB_NAME"),
        "user": _env("DB_USER", "AZURE_DB_USER"),
        "password": _env("DB_PASSWORD", "AZURE_DB_PASSWORD"),
        "port": int(_env("DB_PORT", "AZURE_DB_PORT", default=5432)),
        "sslmode": _env("DB_SSLMODE", "AZURE_DB_SSLMODE", default="disable"),
    }


def get_db_connection():
    """Create PostgreSQL connection using DB_* (preferred) or AZURE_DB_* variables."""
    config = _build_azure_db_config()

    print(
        f"🔎 Connecting to: {config['host']} "
        f"as user: {config.get('user')} "
        f"(port={config.get('port')}, sslmode={config.get('sslmode')})"
    )

    try:
        conn = psycopg2.connect(cursor_factory=RealDictCursor, **config)
        print("✅ Database connected via environment variables")
        return conn
    except Exception as error:
        print("❌ Database connection failed:", error)
        raise
