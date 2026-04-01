from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor, Json
from db import get_db_connection
from routes.admin_guard import require_admin
from datetime import datetime


supplier_user_mgmt_bp = Blueprint(
    "supplier_user_mgmt_bp",
    __name__,
    url_prefix="/api/v1/admin/suppliers/users"
)

# ======================================================
# LIST SUPPLIER USERS
# ======================================================
@supplier_user_mgmt_bp.route("", methods=["GET"])
@require_admin("MANAGE_SUPPLIER_USERS")
def list_supplier_users():
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                u.user_id,
                u.username,
                u.status,
                u.created_at,
                sr.supplier_id,
                sr.company_name_english
            FROM users u
            JOIN supplier_registration sr
              ON sr.supplier_id = u.linked_id
            WHERE u.role = 'supplier'
            ORDER BY u.created_at DESC
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# SUSPEND / ACTIVATE SUPPLIER USER
# ======================================================
@supplier_user_mgmt_bp.route("/<int:user_id>/status", methods=["PATCH"])
@require_admin("MANAGE_SUPPLIER_USERS")
def toggle_supplier_user_status(user_id):
    data = request.json or {}
    new_status = data.get("status")

    if new_status not in ("active", "suspended"):
        return jsonify({"error": "Invalid status"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT user_id, linked_id, status
            FROM users
            WHERE user_id = %s AND role = 'supplier'
        """, (user_id,))
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Supplier user not found"}), 404

        if user["status"] == new_status:
            return jsonify({"message": "No status change"}), 200

        cur.execute("""
            UPDATE users
            SET status = %s
            WHERE user_id = %s
        """, (new_status, user_id))

        if new_status == "suspended":
            cur.execute(
                "DELETE FROM user_sessions WHERE user_id = %s",
                (user_id,)
            )

        cur.execute("""
            INSERT INTO platform_audit_log (
                actor_type,
                actor_user_id,
                linked_id,
                action,
                entity_type,
                entity_id,
                metadata,
                ip_address,
                created_at
            ) VALUES (
                'SUPPLIER',
                %s,
                %s,
                %s,
                'user',
                %s,
                %s,
                %s,
                %s
            )
        """, (
            user_id,
            user["linked_id"],
            "SUSPEND_USER" if new_status == "suspended" else "ACTIVATE_USER",
            user_id,
            Json({
                "old_status": user["status"],
                "new_status": new_status,
                "reason": data.get("reason")
            }),
            request.remote_addr,
            datetime.utcnow()
        ))

        conn.commit()
        return jsonify({"message": "Status updated"}), 200

    except Exception as e:
        conn.rollback()
        print("❌ supplier status error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# FORCE LOGOUT SUPPLIER USER
# ======================================================
@supplier_user_mgmt_bp.route("/<int:user_id>/force-logout", methods=["POST"])
@require_admin("MANAGE_SUPPLIER_USERS")
def force_logout_supplier_user(user_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT user_id, linked_id
            FROM users
            WHERE user_id = %s AND role = 'supplier'
        """, (user_id,))
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Supplier user not found"}), 404

        cur.execute(
            "DELETE FROM user_sessions WHERE user_id = %s",
            (user_id,)
        )

        cur.execute("""
            INSERT INTO platform_audit_log (
                actor_type,
                actor_user_id,
                linked_id,
                action,
                entity_type,
                entity_id,
                ip_address,
                created_at
            ) VALUES (
                'SUPPLIER',
                %s,
                %s,
                'FORCE_LOGOUT',
                'user',
                %s,
                %s,
                %s
            )
        """, (
            user_id,
            user["linked_id"],
            user_id,
            request.remote_addr,
            datetime.utcnow()
        ))

        conn.commit()
        return jsonify({"message": "Supplier user logged out"}), 200

    except Exception as e:
        conn.rollback()
        print("❌ supplier force logout error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()