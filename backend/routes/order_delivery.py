from flask import Blueprint, request, jsonify
from backend.db import get_db_connection

order_delivery_bp = Blueprint("order_delivery", __name__)


# ==========================================================
# ✅ 1. Fetch Delivery Boys from delivery_boys table
# ==========================================================
@order_delivery_bp.route("/api/delivery-boys/<int:supplier_id>", methods=["GET"])
def get_delivery_boys(supplier_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
            SELECT
                delivery_boy_id,
                full_name,
                phone
            FROM delivery_boys
            WHERE supplier_id = %s
        """

        cur.execute(query, (supplier_id,))
        boys = cur.fetchall()

        print("✅ Delivery Boys Found:", boys)

        cur.close()
        conn.close()

        return jsonify(boys), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# ==========================================================
# ✅ 2. Assign Delivery (Insert into order_delivery_assignment)
# ==========================================================
from psycopg2.extras import RealDictCursor

@order_delivery_bp.route("/api/assign-delivery", methods=["POST"])
def assign_delivery():
    try:
        data = request.json
        print("POST DATA RECEIVED:", data)

        order_id = str(data.get("order_id"))
        supplier_id = int(data.get("supplier_id"))

        restaurant_id = data.get("restaurant_id")
        if not restaurant_id:
            return jsonify({"error": "restaurant_id is required"}), 400

        delivery_type = data.get("delivery_type")
        delivery_partner = data.get("delivery_partner")

        delivery_boy_id = data.get("delivery_boy_id")
        if delivery_boy_id:
            delivery_boy_id = int(delivery_boy_id)

        driver_name = data.get("driver_name")
        driver_phone = data.get("driver_phone")

        conn = get_db_connection()

        # ✅ FIXED CURSOR
        cur = conn.cursor(cursor_factory=RealDictCursor)

        insert_query = """
            INSERT INTO order_delivery_assignment
            (order_id, supplier_id, restaurant_id,
             delivery_type, delivery_partner,
             delivery_boy_id, driver_name, driver_phone,
             status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'ASSIGNED')
            RETURNING id;
        """

        cur.execute(insert_query, (
            order_id,
            supplier_id,
            restaurant_id,
            delivery_type,
            delivery_partner,
            delivery_boy_id,
            driver_name,
            driver_phone
        ))

        # ✅ Now this works
        assignment_id = cur.fetchone()["id"]

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message": "✅ Delivery Assigned Successfully",
            "assignment_id": assignment_id
        }), 201

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500


@order_delivery_bp.route("/api/delivery/location/update", methods=["POST"])
def update_location():
    data = request.json

    boy_id = data.get("delivery_boy_id")
    lat = data.get("latitude")
    lng = data.get("longitude")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO delivery_boy_live_location
        (delivery_boy_id, latitude, longitude)
        VALUES (%s,%s,%s)
        ON CONFLICT (delivery_boy_id)
        DO UPDATE SET
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            updated_at = now()
    """, (boy_id, lat, lng))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Location updated"}), 200


@order_delivery_bp.route("/api/delivery/location/<int:boy_id>", methods=["GET"])
def get_location(boy_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT latitude, longitude, updated_at
        FROM delivery_boy_live_location
        WHERE delivery_boy_id = %s
    """, (boy_id,))

    loc = cur.fetchone()
    cur.close()
    conn.close()

    return jsonify(loc), 200
