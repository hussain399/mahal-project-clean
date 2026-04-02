#C:\Users\ADMIN\Documents\ProjectMahal (1)\ProjectMahal\backend\routes\admin_management_routes.py
from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor

from backend.db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action

admin_mgmt_bp = Blueprint(
    "admin_mgmt_bp", __name__, url_prefix="/api/v1/admin/manage"
)

# ======================================================
# ROLE HIERARCHY (ENTERPRISE CONTROL)
# ======================================================
ROLE_PRIORITY = {
    "SUPER_ADMIN": 100,
    "ADMIN": 80,
    "OPS_ADMIN": 60,
    "FINANCE_ADMIN": 50,
    "SUPPORT_ADMIN": 40,
    "READ_ONLY": 10,
}


# ======================================================
# LIST ADMINS (WITH PROFILE DATA + SOFT DELETE)
# ======================================================
@admin_mgmt_bp.route("/admins", methods=["GET"])
@require_admin("MANAGE_ADMIN_USERS")
def list_admins():
    conn = cur = None
    try:
        # 🔍 READ AUDIT (ENTERPRISE COMPLIANCE)
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="VIEW_ADMIN_LIST",
            entity_type="admin_user",
            entity_id="ALL",
            ip_address=request.remote_addr
        )

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                au.admin_id,
                au.name,
                au.email,
                ar.role_name,
                au.is_active,
                au.last_login_at,
                au.created_at,
                au.created_by,
                au.last_login_ip,
                au.failed_login_attempts
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE au.is_deleted = false
            ORDER BY au.created_at DESC
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# CREATE ADMIN
# ======================================================
@admin_mgmt_bp.route("/admins", methods=["POST"])
@require_admin("MANAGE_ADMIN_USERS")
def create_admin():
    data = request.json or {}

    name = data.get("name")
    email = (data.get("email") or "").lower()
    role_name = data.get("role")

    if not name or not email or not role_name:
        return jsonify({"error": "Missing fields"}), 400

    if g.admin["role"] != "SUPER_ADMIN":
        return jsonify({"error": "Only SUPER_ADMIN can create admins"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Prevent duplicate emails
        cur.execute("SELECT 1 FROM admin_users WHERE email = %s AND is_deleted = false", (email,))
        if cur.fetchone():
            return jsonify({"error": "Admin with this email already exists"}), 409

        # Resolve role
        cur.execute("SELECT role_id FROM admin_roles WHERE role_name = %s", (role_name,))
        role = cur.fetchone()
        if not role:
            return jsonify({"error": "Invalid role"}), 400

        role_id = role["role_id"]

        cur.execute("""
            INSERT INTO admin_users (name, email, role_id, created_by)
            VALUES (%s, %s, %s, %s)
            RETURNING admin_id
        """, (name, email, role_id, g.admin["admin_id"]))

        admin_id = cur.fetchone()["admin_id"]
        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="CREATE_ADMIN",
            entity_type="admin_user",
            entity_id=admin_id,
            new_value={"name": name, "email": email, "role": role_name},
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Admin created"}), 201

    except Exception as e:
        conn.rollback()
        print("❌ create_admin:", e)
        return jsonify({"error": "Admin creation failed"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# UPDATE ADMIN ROLE (WITH HIERARCHY ENFORCEMENT)
# ======================================================
@admin_mgmt_bp.route("/admins/<int:admin_id>/role", methods=["PATCH"])
@require_admin("MANAGE_ADMIN_USERS")
def update_admin_role(admin_id):
    data = request.json or {}
    new_role_name = data.get("role")

    if not new_role_name:
        return jsonify({"error": "role required"}), 400

    if g.admin["admin_id"] == admin_id:
        return jsonify({"error": "Cannot change your own role"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Resolve new role
        cur.execute("SELECT role_id FROM admin_roles WHERE role_name = %s", (new_role_name,))
        role = cur.fetchone()
        if not role:
            return jsonify({"error": "Invalid role"}), 400
        new_role_id = role["role_id"]

        # Fetch target admin role
        cur.execute("""
            SELECT ar.role_name
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE au.admin_id = %s AND au.is_deleted = false
        """, (admin_id,))
        old = cur.fetchone()

        if not old:
            return jsonify({"error": "Admin not found"}), 404

        current_role = g.admin["role"]
        target_old_role = old["role_name"]

        # 🔒 HIERARCHY ENFORCEMENT
        if ROLE_PRIORITY.get(current_role, 0) <= ROLE_PRIORITY.get(target_old_role, 0):
            return jsonify({"error": "Cannot modify admin with equal or higher role"}), 403

        if ROLE_PRIORITY.get(new_role_name, 0) >= ROLE_PRIORITY.get(current_role, 0):
            return jsonify({"error": "Cannot assign role equal or higher than yours"}), 403

        if target_old_role == "SUPER_ADMIN":
            return jsonify({"error": "SUPER_ADMIN role cannot be changed"}), 403

        cur.execute("UPDATE admin_users SET role_id = %s WHERE admin_id = %s",
                    (new_role_id, admin_id))

        # Force logout after role change
        cur.execute("DELETE FROM admin_sessions WHERE admin_id = %s", (admin_id,))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="CHANGE_ADMIN_ROLE",
            entity_type="admin_user",
            entity_id=admin_id,
            old_value={"role": target_old_role},
            new_value={"role": new_role_name},
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Role updated"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# ACTIVATE / DEACTIVATE ADMIN (WITH HIERARCHY)
# ======================================================
@admin_mgmt_bp.route("/admins/<int:admin_id>/status", methods=["PATCH"])
@require_admin("MANAGE_ADMIN_USERS")
def toggle_admin_status(admin_id):
    data = request.json or {}
    is_active = data.get("is_active")

    if is_active is None:
        return jsonify({"error": "is_active required"}), 400

    if g.admin["admin_id"] == admin_id:
        return jsonify({"error": "Cannot modify your own status"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT au.is_active, ar.role_name
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE au.admin_id = %s AND au.is_deleted = false
        """, (admin_id,))
        old = cur.fetchone()

        if not old:
            return jsonify({"error": "Admin not found"}), 404

        current_role = g.admin["role"]
        target_role = old["role_name"]

        if ROLE_PRIORITY.get(current_role, 0) <= ROLE_PRIORITY.get(target_role, 0):
            return jsonify({"error": "Cannot modify admin with equal or higher role"}), 403

        if target_role == "SUPER_ADMIN":
            return jsonify({"error": "SUPER_ADMIN cannot be deactivated"}), 403

        cur.execute("UPDATE admin_users SET is_active = %s WHERE admin_id = %s",
                    (is_active, admin_id))

        if not is_active:
            cur.execute("DELETE FROM admin_sessions WHERE admin_id = %s", (admin_id,))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="TOGGLE_ADMIN_STATUS",
            entity_type="admin_user",
            entity_id=admin_id,
            old_value={"is_active": old["is_active"]},
            new_value={"is_active": is_active},
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Status updated"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# FORCE LOGOUT ADMIN
# ======================================================
@admin_mgmt_bp.route("/admins/<int:admin_id>/force-logout", methods=["POST"])
@require_admin("MANAGE_ADMIN_USERS")
def force_logout_admin(admin_id):
    if g.admin["admin_id"] == admin_id:
        return jsonify({"error": "Cannot force logout yourself"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM admin_users WHERE admin_id = %s AND is_deleted = false", (admin_id,))
        if not cur.fetchone():
            return jsonify({"error": "Admin not found"}), 404

        cur.execute("DELETE FROM admin_sessions WHERE admin_id = %s", (admin_id,))
        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="FORCE_LOGOUT_ADMIN",
            entity_type="admin_user",
            entity_id=admin_id,
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Admin logged out from all sessions"}), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# DELETE ADMIN (SOFT DELETE + HIERARCHY)
# ======================================================
@admin_mgmt_bp.route("/admins/<int:admin_id>", methods=["DELETE"])
@require_admin("MANAGE_ADMIN_USERS")
def delete_admin(admin_id):
    if g.admin["admin_id"] == admin_id:
        return jsonify({"error": "You cannot delete your own account"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Fetch admin details for role priority check and logging
        cur.execute("""
            SELECT au.admin_id, au.email, ar.role_name 
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE au.admin_id = %s
        """, (admin_id,))
        target_admin = cur.fetchone()

        if not target_admin:
            return jsonify({"error": "Admin not found"}), 404

        # 2. Hierarchy Check
        current_role = g.admin["role"]
        target_role = target_admin["role_name"]

        if ROLE_PRIORITY.get(current_role, 0) <= ROLE_PRIORITY.get(target_role, 0):
            return jsonify({"error": "Insufficient permissions to delete a higher or equal role"}), 403

        # 3. Execution - Clear child records first to avoid Foreign Key errors
        # Clear active sessions
        cur.execute("DELETE FROM admin_sessions WHERE admin_id = %s", (admin_id,))
        
        # Finally, delete the user
        cur.execute("DELETE FROM admin_users WHERE admin_id = %s", (admin_id,))

        # 4. Finalize
        conn.commit()

        # Log the deletion event (The log remains even if the user is gone)
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="HARD_DELETE_ADMIN",
            entity_type="admin_user",
            entity_id=admin_id,
            old_value=target_admin, # Record what was deleted
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Admin and sessions deleted successfully"}), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# LIST ROLES
# ======================================================
@admin_mgmt_bp.route("/roles", methods=["GET"])
@require_admin("MANAGE_ADMIN_USERS")
def list_admin_roles():
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT role_name FROM admin_roles ORDER BY role_name")
        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# VIEW ROLE PERMISSIONS
# ======================================================
@admin_mgmt_bp.route("/roles/<role_name>/permissions", methods=["GET"])
@require_admin("MANAGE_ADMIN_USERS")
def get_role_permissions(role_name):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT role_id FROM admin_roles WHERE role_name = %s", (role_name,))
        role = cur.fetchone()
        if not role:
            return jsonify({"error": "Role not found"}), 404

        cur.execute("""
            SELECT
                p.permission_code,
                p.description,
                CASE WHEN rp.permission_id IS NOT NULL THEN true ELSE false END AS enabled
            FROM admin_permissions p
            LEFT JOIN admin_role_permissions rp
              ON rp.permission_id = p.permission_id
             AND rp.role_id = %s
            ORDER BY p.permission_code
        """, (role["role_id"],))

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()


@admin_mgmt_bp.route("/roles/<role_name>/permissions", methods=["PATCH"])
@require_admin("MANAGE_ADMIN_USERS")
def update_role_permissions(role_name):
    data = request.json or {}
    permissions = data.get("permissions", [])

    # Only SUPER_ADMIN allowed
    if g.admin["role"] != "SUPER_ADMIN":
        return jsonify({"error": "Only SUPER_ADMIN can modify role permissions"}), 403

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Resolve role safely
        cur.execute("SELECT role_id FROM admin_roles WHERE role_name = %s", (role_name,))
        role = cur.fetchone()
        if not role:
            return jsonify({"error": "Role not found"}), 404

        role_id = role["role_id"]

        # ======================================================
        # UPDATE PERMISSIONS (ATOMIC REPLACE)
        # ======================================================

        # Remove old permissions
        cur.execute("DELETE FROM admin_role_permissions WHERE role_id = %s", (role_id,))

        # Insert new permissions
        for perm in permissions:
            cur.execute("""
                INSERT INTO admin_role_permissions (role_id, permission_id)
                SELECT %s, permission_id
                FROM admin_permissions
                WHERE permission_code = %s
            """, (role_id, perm))

        conn.commit()

        # ======================================================
        # AUDIT (ENTERPRISE COMPLIANCE)
        # ======================================================
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="UPDATE_ROLE_PERMISSIONS",
            entity_type="admin_role",
            entity_id=role_id,
            new_value={"permissions": permissions},
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Role permissions updated"}), 200

    except Exception as e:
        conn.rollback()
        print("❌ update_role_permissions:", e)
        return jsonify({"error": "Permission update failed"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()