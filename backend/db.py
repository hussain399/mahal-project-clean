import os

import psycopg2
from psycopg2.extras import RealDictCursor


LOCAL_DB_HOSTS = {"localhost", "127.0.0.1"}
SERVICEBUS_SUFFIX = ".servicebus.windows.net"


def _env(*names: str, default=None):
    for name in names:
        value = os.getenv(name)
        if value not in (None, ""):
            return value
    return default


def _to_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _build_db_config() -> dict:
    """
    Build PostgreSQL config from environment.
    Priority: DB_* then AZURE_DB_* fallbacks.
    """
    host = _env("DB_HOST", "AZURE_DB_HOST")
    if host is None:
        raise RuntimeError("FATAL: DB_HOST/AZURE_DB_HOST not found in environment!")

    normalized_host = host.strip().lower()
    allow_local_host = _to_bool(os.getenv("ALLOW_LOCAL_DB_HOST"), default=True)

    if normalized_host.endswith(SERVICEBUS_SUFFIX):
        raise ValueError(
            "Use Hybrid Connection alias/host as DB host (for example: postgres-db), "
            "not the *.servicebus.windows.net relay endpoint."
        )

    if normalized_host in LOCAL_DB_HOSTS and not allow_local_host:
        raise ValueError(
            "DB host is localhost/127.0.0.1 but ALLOW_LOCAL_DB_HOST is disabled. "
            "Enable ALLOW_LOCAL_DB_HOST=1 or provide the hybrid alias hostname."
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
    config = _build_db_config()

    print(
        f"🔎 Connecting to DB host={config['host']} user={config.get('user')} "
        f"port={config.get('port')} sslmode={config.get('sslmode')}"
    )

    try:
        conn = psycopg2.connect(cursor_factory=RealDictCursor, **config)
        print("✅ Database connected via environment variables")
        return conn
    except Exception as error:
        print("❌ Database connection failed:", error)
        raise
