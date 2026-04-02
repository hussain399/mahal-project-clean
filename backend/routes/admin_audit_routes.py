#C:\Users\ADMIN\Documents\ProjectMahal (1)\ProjectMahal\backend\routes\admin_audit_routes.py
from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection
from routes.admin_guard import require_admin

admin_audit_bp = Blueprint(
    "admin_audit_bp", __name__, url_prefix="/api/v1/admin/audit"
)

# ======================================================
# LIST AUDIT LOGS (READ-ONLY)
# ======================================================
@admin_audit_bp.route("", methods=["GET"])
@require_admin("MANAGE_ADMIN_USERS")
def list_admin_audit_logs():
    """
    STAGE 2 AUDIT VISIBILITY RULES

    - SUPER_ADMIN:
        • sees all audit logs
    - Regular Admin:
        • sees only logs where admin_id = self
    """

    entity_type = request.args.get("entity_type")
    actor_admin_id = request.args.get("admin_id")  # <-- NEW (actor-based filter)

    try:
        limit = min(int(request.args.get("limit", 100)), 200)
    except ValueError:
        limit = 100

    # Safe cast
    if actor_admin_id:
        try:
            actor_admin_id = int(actor_admin_id)
        except ValueError:
            return jsonify({"error": "Invalid admin_id"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT
                aal.audit_id,
                aal.action,
                aal.entity_type,
                aal.entity_id,
                aal.old_value,
                aal.new_value,
                aal.ip_address,
                aal.created_at,
                COALESCE(au.name, 'SYSTEM') AS performed_by,
                ar.role_name AS performed_by_role
            FROM admin_audit_log aal
            LEFT JOIN admin_users au ON au.admin_id = aal.admin_id
            LEFT JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE 1=1
        """
        params = []

        # --------------------------------------------------
        # 🔐 VISIBILITY RULE
        # --------------------------------------------------
        if g.admin["role"] != "SUPER_ADMIN":
            # Regular admins see ONLY their own actions
            query += " AND aal.admin_id = %s"
            params.append(g.admin["admin_id"])
        else:
            # SUPER_ADMIN may filter by actor if requested
            if actor_admin_id is not None:
                query += " AND aal.admin_id = %s"
                params.append(actor_admin_id)

        # Optional entity filter (secondary)
        if entity_type:
            query += " AND aal.entity_type = %s"
            params.append(entity_type)

        query += " ORDER BY aal.created_at DESC LIMIT %s"
        params.append(limit)

        cur.execute(query, params)
        return jsonify(cur.fetchall()), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()