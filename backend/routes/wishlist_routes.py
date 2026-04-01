# from flask import Blueprint, request, jsonify
# from db import get_db_connection

# wishlist_bp = Blueprint("wishlist_bp", __name__)

# # =====================================================
# # GET WISHLIST (restaurant-wise)
# # =====================================================
# @wishlist_bp.route("/wishlist", methods=["GET"])
# def get_wishlist():
#     restaurant_id = request.args.get("restaurant_id")

#     if not restaurant_id:
#         return jsonify({"error": "restaurant_id is required"}), 400

#     conn = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()

#         cur.execute("""
#             SELECT
#                 wishlist_id,
#                 restaurant_id,
#                 supplier_id,
#                 product_id,
#                 product_name_english,
#                 price_per_unit,
#                 unit_of_measure,
#                 added_at
#             FROM wishlist_management
#             WHERE restaurant_id = %s
#             ORDER BY added_at DESC
#         """, (restaurant_id,))

#         data = cur.fetchall()
#         return jsonify(data), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if conn:
#             conn.close()


# # =====================================================
# # ADD TO WISHLIST
# # =====================================================
# @wishlist_bp.route("/wishlist/add", methods=["POST"])
# def add_to_wishlist():
#     conn = None
#     try:
#         data = request.get_json()

#         conn = get_db_connection()
#         cur = conn.cursor()

#         cur.execute("""
#             INSERT INTO wishlist_management
#             (
#                 restaurant_id,
#                 supplier_id,
#                 product_id,
#                 product_name_english,
#                 price_per_unit,
#                 unit_of_measure,
#                 product_images
#             )
#             VALUES (%s, %s, %s, %s, %s, %s, %s)
#             RETURNING wishlist_id
#         """, (
#             data["restaurant_id"],
#             data["supplier_id"],
#             data["product_id"],
#             data.get("product_name_english"),
#             data.get("price_per_unit"),
#             data.get("unit_of_measure"),
#             data.get("product_images")  # bytea[] expected
#         ))

#         wishlist_id = cur.fetchone()["wishlist_id"]
#         conn.commit()

#         return jsonify({
#             "message": "Added to wishlist ❤️",
#             "wishlist_id": wishlist_id
#         }), 201

#     except Exception as e:
#         if conn:
#             conn.rollback()

#         # unique_wishlist constraint handling
#         if "unique_wishlist" in str(e):
#             return jsonify({
#                 "message": "Product already exists in wishlist"
#             }), 409

#         return jsonify({"error": str(e)}), 500

#     finally:
#         if conn:
#             conn.close()


# # =====================================================
# # REMOVE FROM WISHLIST
# # =====================================================
# @wishlist_bp.route("/wishlist/remove/<int:wishlist_id>", methods=["DELETE"])
# def remove_from_wishlist(wishlist_id):
#     conn = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()

#         cur.execute("""
#             DELETE FROM wishlist_management
#             WHERE wishlist_id = %s
#         """, (wishlist_id,))

#         conn.commit()

#         return jsonify({
#             "message": "Removed from wishlist 💔"
#         }), 200

#     except Exception as e:
#         if conn:
#             conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if conn:
#             conn.close()









from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

wishlist_bp = Blueprint("wishlist_bp", __name__)

# =====================================================
# JWT → RESTAURANT CONTEXT (SINGLE SOURCE OF TRUTH)
# =====================================================
def get_restaurant_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth.replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "restaurant":
            return None
        return decoded.get("linked_id")
    except Exception:
        return None


# =====================================================
# GET WISHLIST (JWT BASED – RESTAURANT ONLY)
# =====================================================
@wishlist_bp.route("/wishlist", methods=["GET"])
def get_wishlist():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                wishlist_id,
                restaurant_id,
                supplier_id,
                product_id,
                product_name_english,
                price_per_unit,
                unit_of_measure,
                added_at
            FROM wishlist_management
            WHERE restaurant_id = %s
            ORDER BY added_at DESC
        """, (restaurant_id,))

        data = cur.fetchall()
        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =====================================================
# ADD TO WISHLIST (JWT BASED – SAFE & CLEAN)
# =====================================================
@wishlist_bp.route("/wishlist/add", methods=["POST"])
def add_to_wishlist():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    if "product_id" not in data:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ✅ FIXED COLUMN NAME
        cur.execute("""
            SELECT
                supplier_id,
                product_name_english,
                price_per_unit,
                unit_of_measure
            FROM product_management
            WHERE product_id = %s
        """, (data["product_id"],))
        product = cur.fetchone()

        if not product:
            return jsonify({"error": "Product not found"}), 404

        cur.execute("""
            INSERT INTO wishlist_management
            (
                restaurant_id,
                supplier_id,
                product_id,
                product_name_english,
                price_per_unit,
                unit_of_measure,
                product_images
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING wishlist_id
        """, (
            restaurant_id,
            product["supplier_id"],
            data["product_id"],
            product["product_name_english"],
            product["price_per_unit"],   # ✅ FIXED
            product["unit_of_measure"],
            data.get("product_images")
        ))

        wishlist_id = cur.fetchone()["wishlist_id"]
        conn.commit()

        return jsonify({
            "message": "Added to wishlist ❤️",
            "wishlist_id": wishlist_id
        }), 201

    except Exception as e:
        conn.rollback()

        if "unique_wishlist" in str(e).lower():
            return jsonify({"message": "Product already exists in wishlist"}), 409

        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# =====================================================
# REMOVE FROM WISHLIST (OWNER SAFE)
# =====================================================
@wishlist_bp.route("/wishlist/remove/<int:wishlist_id>", methods=["DELETE"])
def remove_from_wishlist(wishlist_id):
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            DELETE FROM wishlist_management
            WHERE wishlist_id = %s
              AND restaurant_id = %s
        """, (wishlist_id, restaurant_id))

        conn.commit()
        return jsonify({"message": "Removed from wishlist 💔"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
@wishlist_bp.route("/wishlist/count", methods=["GET", "OPTIONS"])
def wishlist_count():

    if request.method == "OPTIONS":
        return "", 200

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"count": 0}), 200

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT COUNT(*) AS count
            FROM wishlist_management
            WHERE restaurant_id = %s
        """, (restaurant_id,))

        count = cur.fetchone()[0]

        return jsonify({"count": count}), 200

    except:
        return jsonify({"count": 0}), 200

    finally:
        cur.close()
        conn.close()