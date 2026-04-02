import jwt
from functools import wraps
from flask import request, jsonify, current_app, g
from datetime import datetime, timezone
from psycopg2.extras import RealDictCursor

from backend.db import get_db_connection
from routes.admin_audit import log_admin_action


def require_admin(permission=None):

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):

            # ======================================================
            # ALLOW CORS PREFLIGHT
            # ======================================================
            if request.method == "OPTIONS":
                return "", 200

            # ======================================================
            # TOKEN EXTRACTION
            # ======================================================
            raw_token = (
                request.headers.get("Authorization", "")
                .replace("Bearer ", "")
                .strip()
                or request.args.get("token", "").strip()
            )
            token = raw_token.strip('"').strip("'")

            if not token:
                return jsonify({"error": "Missing admin token"}), 401

            # ======================================================
            # TOKEN VALIDATION (JWT STRUCTURE + EXP ONLY)
            # ======================================================
            try:
                decoded = jwt.decode(
                    token,
                    current_app.config.get("ADMIN_JWT_SECRET", "MAHAL_ADMIN_SECRET_2025"),
                    algorithms=["HS256"],
                )

                jwt_admin_id = decoded.get("admin_id")

                if not jwt_admin_id:
                    raise Exception("Missing admin_id in token")

            except jwt.ExpiredSignatureError:
                log_admin_action(
                    admin_id=None,
                    action="TOKEN_EXPIRED",
                    entity_type="admin_session",
                    ip_address=request.remote_addr
                )
                return jsonify({"error": "Token expired"}), 401

            except Exception:
                log_admin_action(
                    admin_id=None,
                    action="TOKEN_INVALID",
                    entity_type="admin_session",
                    ip_address=request.remote_addr
                )
                return jsonify({"error": "Invalid token"}), 401

            # ======================================================
            # STAGE 1 — SESSION VALIDATION (DB IS AUTHORITY)
            # ======================================================
            conn = cur = None
            try:
                conn = get_db_connection()
                cur = conn.cursor(cursor_factory=RealDictCursor)

                cur.execute("""
                    SELECT 
                        au.admin_id,
                        ar.role_name
                    FROM admin_sessions s
                    JOIN admin_users au ON au.admin_id = s.admin_id
                    JOIN admin_roles ar ON ar.role_id = au.role_id
                    WHERE s.token = %s
                      AND au.admin_id = %s
                      AND s.expires_at > %s
                      AND au.is_active = true
                      AND au.is_deleted = false
                """, (token, jwt_admin_id, datetime.now(timezone.utc)))

                row = cur.fetchone()

                if not row:
                    log_admin_action(
                        admin_id=jwt_admin_id,
                        action="SESSION_INVALID",
                        entity_type="admin_session",
                        ip_address=request.remote_addr
                    )
                    return jsonify({"error": "Session invalid or logged out"}), 401

                admin_id = row["admin_id"]
                role_name = row["role_name"]

            finally:
                if cur:
                    cur.close()
                if conn:
                    conn.close()

            # ======================================================
            # STAGE 2 — LOAD PERMISSIONS LIVE (DB = SOURCE OF TRUTH)
            # ======================================================
            conn = cur = None
            try:
                conn = get_db_connection()
                cur = conn.cursor(cursor_factory=RealDictCursor)

                cur.execute("""
                    SELECT p.permission_code
                    FROM admin_role_permissions rp
                    JOIN admin_permissions p ON p.permission_id = rp.permission_id
                    JOIN admin_users au ON au.role_id = rp.role_id
                    WHERE au.admin_id = %s
                """, (admin_id,))

                rows = cur.fetchall()
                db_permissions = [r["permission_code"] for r in rows]

            finally:
                if cur:
                    cur.close()
                if conn:
                    conn.close()

            # ======================================================
            # PERMISSION CHECK (FINAL AUTHORITY)
            # ======================================================
            if permission:
                if permission not in db_permissions:
                    log_admin_action(
                        admin_id=admin_id,
                        action="PERMISSION_DENIED",
                        entity_type="permission",
                        entity_id=0,
                        ip_address=request.remote_addr
                    )
                    return jsonify({"error": "Forbidden"}), 403

            # ======================================================
            # ATTACH CONTEXT (DOWNSTREAM TRUSTS ONLY THIS)
            # ======================================================
            g.admin = {
                "admin_id": admin_id,
                "role": role_name,
                "permissions": db_permissions,
            }

            return fn(*args, **kwargs)

        return wrapper

    return decorator