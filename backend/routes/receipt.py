from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from uuid import uuid4

receipt_bp = Blueprint("receipt", __name__, url_prefix="/api/v1/receipt")


def get_db():
    return psycopg2.connect(
        host="localhost",
        database="MAHALDATABASE",
        user="postgres",
        password="Appu1718"
    )


# =====================================================
# GENERATE RECEIPT (SYSTEM GENERATED + SNAPSHOT FREEZE)
# POST /api/v1/receipt/generate/<order_id>
# =====================================================
@receipt_bp.route("/generate/<order_id>", methods=["POST"])
def generate_receipt(order_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1️⃣ Check if receipt exists
        cur.execute("SELECT receipt_id FROM receipt WHERE order_id = %s", (order_id,))
        existing = cur.fetchone()
        if existing:
            return jsonify({"message": "Receipt already exists"}), 200

        # 2️⃣ Fetch order header
        cur.execute("""
            SELECT order_id, restaurant_id, supplier_id, total_amount
            FROM order_header WHERE order_id = %s
        """, (order_id,))
        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # 3️⃣ Fetch restaurant snapshot info
        cur.execute("""
            SELECT
                restaurant_name_english AS name,
                vat_tax_number AS vat,
                contact_person_mobile AS phone,
                city
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (order["restaurant_id"],))
        restaurant = cur.fetchone()

        # 4️⃣ Fetch supplier snapshot info
        cur.execute("""
            SELECT
                company_name_english AS name,
                vat_tax_number AS vat,
                contact_person_mobile AS phone,
                city
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (order["supplier_id"],))
        supplier = cur.fetchone()

        # 5️⃣ Generate receipt number
        receipt_number = f"RCP-{datetime.now().year}-{uuid4().hex[:6].upper()}"

        # 6️⃣ Insert snapshot into receipt table
        cur.execute("""
            INSERT INTO receipt (
                order_id,
                invoice_id,
                restaurant_id,
                supplier_id,
                receipt_number,
                settlement_type,
                status,
                total_amount,
                remarks,
                restaurant_name,
                restaurant_vat,
                restaurant_phone,
                restaurant_city,
                supplier_name,
                supplier_vat,
                supplier_phone,
                supplier_city
            )
            VALUES (
                %s, (SELECT invoice_id FROM invoice_header WHERE order_id=%s),
                %s, %s, %s, 'SYSTEM', 'RECEIVED', %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s
            ) RETURNING receipt_id
        """, (
            order["order_id"], order["order_id"],
            order["restaurant_id"], order["supplier_id"],
            receipt_number,
            order["total_amount"], "System generated receipt",
            restaurant["name"], restaurant["vat"], restaurant["phone"], restaurant["city"],
            supplier["name"], supplier["vat"], supplier["phone"], supplier["city"]
        ))

        receipt_id = cur.fetchone()["receipt_id"]
        conn.commit()

        return jsonify({"message": "Receipt generated", "receipt_id": receipt_id}), 201

    except Exception as e:
        conn.rollback()
        print("Receipt generation error:", e)
        return jsonify({"error": "Receipt generation failed"}), 500

    finally:
        cur.close()
        conn.close()


# =====================================================
# GET RECEIPT DETAILS (FREEZE SNAPSHOT MODE)
# GET /api/v1/receipt/<order_id>
# =====================================================
@receipt_bp.route("/<order_id>", methods=["GET"])
def get_receipt(order_id):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                receipt_id,
                receipt_number,
                receipt_date,
                settlement_type,
                status,
                total_amount,
                remarks,
                restaurant_name,
                restaurant_vat,
                restaurant_phone,
                restaurant_city,
                supplier_name,
                supplier_vat,
                supplier_phone,
                supplier_city
            FROM receipt
            WHERE order_id = %s
        """, (order_id,))
        receipt = cur.fetchone()

        if not receipt:
            return jsonify({"error": "Receipt not found"}), 404

        # Items
        cur.execute("""
            SELECT
                product_name_english AS product,
                quantity,
                price_per_unit AS unit_price,
                discount,
                total_amount AS line_total
            FROM order_items WHERE order_id=%s
        """, (order_id,))
        items = cur.fetchall()

        return jsonify({
            "receipt": receipt,
            "items": items
        })

    except Exception as e:
        print("Receipt fetch error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()