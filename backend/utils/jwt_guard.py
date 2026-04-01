import jwt
from functools import wraps
from flask import request, jsonify

# SAME SECRET USED IN auth_routes.py
JWT_SECRET = "MAHAL_SUPER_SECRET_2025"


# ======================================================
# ✅ SUPPLIER TOKEN PROTECTION
# ======================================================
def supplier_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):

        token = request.headers.get("Authorization", "").replace("Bearer ", "")

        if not token:
            return jsonify({"error": "Missing token"}), 401

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

            # Supplier Only Access
            if decoded.get("role") != "SUPPLIER":
                return jsonify({"error": "Unauthorized"}), 403

            # Attach user info
            request.user = decoded

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401

        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return fn(*args, **kwargs)

    return wrapper
