#  C:\Users\ADMIN\Documents\ProjectMahal (1)\ProjectMahal\backend\routes\admin_audit.py
from db import get_db_connection
from datetime import datetime
from psycopg2.extras import Json


ALLOWED_ACTIONS = {
    "ADMIN_LOGIN",
    "ADMIN_LOGOUT",
    "ADMIN_LOGIN_FAILED",
    "CREATE_ADMIN",
    "DELETE_ADMIN",
    "CHANGE_ADMIN_ROLE",
    "TOGGLE_ADMIN_STATUS",
    "FORCE_LOGOUT_ADMIN",
    "PERMISSION_DENIED",
    "TOKEN_EXPIRED",
    "TOKEN_INVALID",
    "SESSION_INVALID",
    "READ_ACCESS",

    # ✅ SUPPLIER APPROVAL AUDITS
    "APPROVE_SUPPLIER",
    "REJECT_SUPPLIER",
    "RESUBMIT_SUPPLIER",

    # ✅ RESTAURANT APPROVAL AUDITS
    "APPROVE_RESTAURANT",
    "REJECT_RESTAURANT",
    "RESUBMIT_RESTAURANT",
}


def log_admin_action(
    admin_id,
    action,
    entity_type=None,
    entity_id=None,
    old_value=None,
    new_value=None,
    ip_address=None
):
    if not action or action not in ALLOWED_ACTIONS:
        return

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO admin_audit_log (
                admin_id, action, entity_type, entity_id,
                old_value, new_value, ip_address, created_at
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                admin_id,
                action,
                entity_type,
                entity_id,
                Json(old_value) if isinstance(old_value, (dict, list)) else None,
                Json(new_value) if isinstance(new_value, (dict, list)) else None,
                ip_address or "UNKNOWN",
                datetime.utcnow(),
            ),
        )
        conn.commit()
    except Exception as e:
        print("❌ ADMIN AUDIT LOG FAILED:", e)
    finally:
        if cur: cur.close()
        if conn: conn.close()