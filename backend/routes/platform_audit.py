from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.admin_guard import require_admin


platform_audit_bp = Blueprint(
    "platform_audit_bp",
    __name__,
    url_prefix="/api/v1/admin/platform-audit"
)

# ======================================================
# LIST PLATFORM AUDIT LOGS (SUPPLIER / RESTAURANT)
# ======================================================
@platform_audit_bp.route("", methods=["GET"])
@require_admin("MANAGE_ADMIN_USERS")
def list_platform_audit_logs():
    actor_type = request.args.get("actor_type")   # SUPPLIER / RESTAURANT
    linked_id = request.args.get("linked_id")     # supplier_id / restaurant_id
    action = request.args.get("action")

    try:
        limit = min(int(request.args.get("limit", 50)), 200)
        offset = max(int(request.args.get("offset", 0)), 0)
    except ValueError:
        return jsonify({"error": "Invalid pagination"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT
                audit_id,
                actor_type,
                actor_user_id,
                linked_id,
                action,
                entity_type,
                entity_id,
                metadata,
                ip_address,
                created_at
            FROM platform_audit_log
            WHERE 1=1
        """
        params = []

        if actor_type:
            query += " AND actor_type = %s"
            params.append(actor_type)

        if linked_id:
            query += " AND linked_id = %s"
            params.append(linked_id)

        if action:
            query += " AND action = %s"
            params.append(action)

        query += """
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        cur.execute(query, params)
        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()