import jwt
from functools import wraps
from flask import request, jsonify, g
from psycopg2.extras import RealDictCursor
from db import get_db_connection

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"


def require_supplier():

    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):

            if request.method == "OPTIONS":
                return "", 200

            raw_token = (
                request.headers.get("Authorization", "")
                .replace("Bearer ", "")
                .strip()
                or request.args.get("token", "").strip()
            )

            token = raw_token.strip('"').strip("'")

            if not token:
                return jsonify({"error": "Missing supplier token"}), 401

            try:

                decoded = jwt.decode(
                    token,
                    JWT_SECRET,
                    algorithms=["HS256"]
                )

                supplier_id = decoded.get("linked_id")

                if not supplier_id:
                    return jsonify({"error": "Invalid token"}), 401

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401

            except Exception:
                return jsonify({"error": "Invalid token"}), 401


            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute("""
                SELECT supplier_id, company_name_english, approval_status
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (supplier_id,))

            supplier = cur.fetchone()

            cur.close()
            conn.close()

            if not supplier:
                return jsonify({"error": "Supplier not found"}), 401

            if supplier["approval_status"] != "Approved":
                return jsonify({"error": "Supplier not approved"}), 403

            g.supplier = {
                "supplier_id": supplier["supplier_id"],
                "company_name": supplier["company_name_english"]
            }

            return fn(*args, **kwargs)

        return wrapper

    return decorator