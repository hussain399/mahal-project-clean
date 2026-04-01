from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from db import get_db_connection
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

restaurant_reports_bp = Blueprint("restaurant_reports_bp", __name__)


# =========================================================
# AUTH
# =========================================================
def get_restaurant_from_token():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    try:

        decoded = jwt.decode(
            auth.replace("Bearer ", ""),
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role", "").upper() != "RESTAURANT":
            return None, ("Forbidden", 403)

        return decoded.get("linked_id"), None

    except Exception:
        return None, ("Invalid token", 401)


# =========================================================
# PURCHASE REPORT
# =========================================================
@restaurant_reports_bp.route(
    "/restaurant/reports/purchases",
    methods=["GET"]
)
def purchase_report():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                oh.order_id,
                oh.order_date,
                oh.total_amount,
                oh.status,
                oh.supplier_id,
                sr.company_name_english AS supplier_name,

                oi.product_id,
                oi.product_name_english,
                oi.quantity,
                oi.total_amount AS item_total

            FROM order_header oh

            JOIN order_items oi
                ON oi.order_id = oh.order_id

            JOIN supplier_registration sr
                ON sr.supplier_id = oh.supplier_id

            WHERE oh.restaurant_id = %s

            ORDER BY oh.order_date DESC
        """, (restaurant_id,))

        return jsonify(cur.fetchall()), 200

    finally:
        cur.close()
        conn.close()


# =========================================================
# GRN REPORT  ✅ FIXED (ONE ROW PER GRN)
# =========================================================
@restaurant_reports_bp.route(
    "/restaurant/reports/grn",
    methods=["GET"]
)
def grn_report():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                gh.grn_id,
                gh.order_id,
                gh.status,
                gh.created_at,

                sr.company_name_english AS supplier_name,

                COALESCE(SUM(gi.received_quantity), 0) AS received_qty,
                COUNT(gi.grn_item_id) AS total_items

            FROM grn_header gh

            JOIN supplier_registration sr
                ON sr.supplier_id = gh.supplier_id

            LEFT JOIN grn_items gi
                ON gi.grn_id = gh.grn_id

            WHERE gh.restaurant_id = %s

            GROUP BY
                gh.grn_id,
                gh.order_id,
                gh.status,
                gh.created_at,
                sr.company_name_english

            ORDER BY gh.created_at DESC
        """, (restaurant_id,))

        rows = cur.fetchall()

        return jsonify(rows), 200

    finally:
        cur.close()
        conn.close()


# =========================================================
# SUPPLIER PERFORMANCE REPORT
# =========================================================
@restaurant_reports_bp.route(
    "/restaurant/reports/suppliers",
    methods=["GET"]
)
def supplier_report():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                sr.supplier_id,
                sr.company_name_english AS supplier_name,

                COUNT(DISTINCT oh.order_id) AS total_orders,
                COALESCE(SUM(oh.total_amount), 0) AS total_purchase,

                COUNT(
                    CASE WHEN oh.status = 'DELIVERED' THEN 1 END
                ) AS delivered_orders,

                COUNT(
                    CASE WHEN oh.status != 'DELIVERED' THEN 1 END
                ) AS pending_orders

            FROM supplier_registration sr

            JOIN order_header oh
                ON oh.supplier_id = sr.supplier_id

            WHERE oh.restaurant_id = %s

            GROUP BY sr.supplier_id, sr.company_name_english

            ORDER BY total_purchase DESC
        """, (restaurant_id,))

        return jsonify(cur.fetchall()), 200

    finally:
        cur.close()
        conn.close()
# =========================================================
# INVOICE REPORT
# =========================================================
@restaurant_reports_bp.route(
    "/restaurant/reports/invoices",
    methods=["GET"]
)
def invoice_report():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                ih.invoice_id,
                ih.invoice_number,
                ih.order_id,
                ih.invoice_date,
                ih.invoice_status,
                ih.payment_status,

                ih.grand_total,   -- ✅ CORRECT COLUMN

                sr.company_name_english AS supplier_name,

                COUNT(ii.invoice_item_id) AS total_items

            FROM invoice_header ih

            JOIN supplier_registration sr
                ON sr.supplier_id = ih.supplier_id

            LEFT JOIN invoice_items ii
                ON ii.invoice_id = ih.invoice_id

            WHERE ih.restaurant_id = %s

            GROUP BY
                ih.invoice_id,
                ih.invoice_number,
                ih.order_id,
                ih.invoice_date,
                ih.invoice_status,
                ih.payment_status,
                ih.grand_total,
                sr.company_name_english

            ORDER BY ih.invoice_date DESC
        """, (restaurant_id,))

        return jsonify(cur.fetchall()), 200

    finally:
        cur.close()
        conn.close()
