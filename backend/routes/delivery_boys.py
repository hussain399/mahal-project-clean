from flask import Blueprint, request, jsonify
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

delivery_boys_bp = Blueprint("delivery_boys_bp", __name__)


# ==========================================
# ✅ USE SAME AUTH STYLE AS orders_routes.py
# ==========================================
def get_supplier_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    token = auth.replace("Bearer ", "")

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        role = decoded.get("role", "").upper()
        if role != "SUPPLIER":
            return None, ("Forbidden", 403)

        supplier_id = decoded.get("linked_id")
        if not supplier_id:
            return None, ("Supplier ID missing", 401)

        return supplier_id, None

    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)

    except Exception as e:
        print("JWT ERROR:", e)
        return None, ("Invalid token", 401)


# ==========================================
# ✅ ADD DELIVERY BOY
# ==========================================
@delivery_boys_bp.route("/api/v1/delivery-boys", methods=["POST"])
def add_delivery_boy():

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}

    name = data.get("name")
    mobile = data.get("mobile")
    vehicle_type = data.get("vehicle_type")
    vehicle_number = data.get("vehicle_number")

    if not name or not mobile:
        return jsonify({"error": "Name and mobile required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            INSERT INTO delivery_boys
            (supplier_id, name, mobile, vehicle_type, vehicle_number)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            supplier_id,
            name,
            mobile,
            vehicle_type,
            vehicle_number
        ))

        new_id = cur.fetchone()["id"]
        conn.commit()

        return jsonify({
            "message": "Delivery boy added successfully",
            "id": new_id
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# ==========================================
# ✅ UPDATE DELIVERY BOY
# ==========================================
@delivery_boys_bp.route("/api/v1/delivery-boys/<int:boy_id>", methods=["PUT"])
def update_delivery_boy(boy_id):

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}

    name = data.get("name")
    mobile = data.get("mobile")
    vehicle_type = data.get("vehicle_type")
    vehicle_number = data.get("vehicle_number")

    if not name or not mobile:
        return jsonify({"error": "Name and mobile required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ✅ Update only supplier's own delivery boys
        cur.execute("""
            UPDATE delivery_boys
            SET name = %s,
                mobile = %s,
                vehicle_type = %s,
                vehicle_number = %s
            WHERE id = %s AND supplier_id = %s
            RETURNING id, name, mobile, vehicle_type, vehicle_number
        """, (
            name,
            mobile,
            vehicle_type,
            vehicle_number,
            boy_id,
            supplier_id
        ))

        updated = cur.fetchone()

        if not updated:
            return jsonify({"error": "Delivery boy not found"}), 404

        conn.commit()

        return jsonify({
            "message": "Delivery boy updated successfully",
            "data": updated
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# ==========================================
# ✅ GET DELIVERY BOYS LIST
# ==========================================
@delivery_boys_bp.route("/api/v1/delivery-boys", methods=["GET"])
def get_delivery_boys():

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT id, name, mobile, vehicle_type, vehicle_number
            FROM delivery_boys
            WHERE supplier_id = %s
            ORDER BY created_at DESC
        """, (supplier_id,))

        boys = cur.fetchall()
        return jsonify(boys), 200

    finally:
        cur.close()
        conn.close()


# ==========================================
# ✅ DELETE DELIVERY BOY
# ==========================================
@delivery_boys_bp.route("/api/v1/delivery-boys/<int:boy_id>", methods=["DELETE"])
def delete_delivery_boy(boy_id):

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            DELETE FROM delivery_boys
            WHERE id = %s AND supplier_id = %s
        """, (boy_id, supplier_id))

        conn.commit()

        return jsonify({"message": "Deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
