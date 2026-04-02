# from functools import wraps
# from flask import request, jsonify
# from utils.driver_token import verify_driver_token


# def driver_required(f):

#     @wraps(f)
#     def wrapper(*args, **kwargs):

#         auth = request.headers.get("Authorization")

#         if not auth:
#             return jsonify({"error": "Driver token missing"}), 401

#         token = auth.replace("Bearer ", "")

#         data = verify_driver_token(token)

#         if not data:
#             return jsonify({"error": "Invalid or expired token"}), 401

#         request.driver = data

#         return f(*args, **kwargs)

#     return wrapper




from functools import wraps
from flask import request, jsonify
from utils.driver_token import verify_driver_token
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime


def driver_required(f):

    @wraps(f)
    def wrapper(*args, **kwargs):

        auth = request.headers.get("Authorization")

        if not auth:
            return jsonify({"error": "Driver token missing"}), 401

        token = auth.replace("Bearer ", "")

        data = verify_driver_token(token)

        if not data:
            return jsonify({"error": "Invalid or expired token"}), 401

        order_id = data.get("order_id")

        # =============================
        # CHECK DELIVERY STATUS
        # =============================
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT status, token_expiry
            FROM order_delivery
            WHERE order_id = %s
            ORDER BY id DESC
            LIMIT 1
        """, (order_id,))

        row = cur.fetchone()

        cur.close()
        conn.close()

        if not row:
            return jsonify({"error": "Delivery not found"}), 404

        # ❌ BLOCK AFTER DELIVERY
        if row["status"] == "DELIVERED":
            return jsonify({
                "error": "Delivery already completed"
            }), 403

        # ❌ BLOCK EXPIRED TOKEN (DB LEVEL)
        if row["token_expiry"] and row["token_expiry"] < datetime.utcnow():
            return jsonify({
                "error": "Link expired"
            }), 403

        # attach driver info
        request.driver = data

        return f(*args, **kwargs)

    return wrapper