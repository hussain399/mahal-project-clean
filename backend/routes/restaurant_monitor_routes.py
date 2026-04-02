

from flask import Blueprint, jsonify, request, g
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action

restaurant_monitor_bp = Blueprint(
    "restaurant_monitor_bp",
    __name__,
    url_prefix="/api/v1/admin/monitor/restaurant"
)

# ======================================================
# INTERNAL AUDIT
# ======================================================
def audit_read(restaurant_id, section):
    log_admin_action(
        admin_id=g.admin["admin_id"],
        action="READ_ACCESS",
        entity_type="restaurant_monitor",
        entity_id=str(restaurant_id),
        new_value={"section": section},
        ip_address=request.remote_addr
    )

# ======================================================
# 0. LIST RESTAURANTS
# ======================================================
@restaurant_monitor_bp.route("/list", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def list_restaurants():
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
           SELECT DISTINCT ON (rr.restaurant_id)
    rr.restaurant_id,
    rr.restaurant_name_english,
    rr.approval_status,
    rr.created_at AS registered_at,

    u.user_id,
    u.username,
    u.status AS user_status   -- 👈 IMPORTANT

FROM restaurant_registration rr
JOIN users u
  ON u.linked_id = rr.restaurant_id
 AND u.role = 'restaurant'

WHERE LOWER(rr.approval_status) = 'approved'
ORDER BY rr.restaurant_id, u.created_at ASC
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
@restaurant_monitor_bp.route("/<int:restaurant_id>/summary", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_summary(restaurant_id):

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ================= RESTAURANT =================
        cur.execute("""
            SELECT *
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))
        restaurant = cur.fetchone()

        if not restaurant:
            return jsonify({"error": "Restaurant not found"}), 404

        # ================= BRANCHES =================
        cur.execute("""
            SELECT *
            FROM restaurant_branch_registration
            WHERE restaurant_id = %s
            ORDER BY branch_id ASC
        """, (restaurant_id,))
        branches = cur.fetchall()

        # ================= STORES UNDER EACH BRANCH =================
        for branch in branches:
            cur.execute("""
                SELECT *
                FROM restaurant_store_registration
                WHERE restaurant_id = %s
                  AND branch_name = %s
                ORDER BY store_id ASC
            """, (restaurant_id, branch["branch_name_english"]))

            stores = cur.fetchall()

            # SAME AS SUPPLIER STYLE
            branch["stores"] = stores

        # SAME AS SUPPLIER
        restaurant["branches"] = branches

        return jsonify(restaurant), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()




# ======================================================
# 2. RESTAURANT ORDERS (FULL DETAILS WITH SUPPLIER)
# ======================================================
@restaurant_monitor_bp.route("/<int:restaurant_id>/orders", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_orders(restaurant_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                oh.order_id,
                oh.status,
                oh.total_amount,
                oh.order_date,
                oh.payment_status,
                oh.remarks,

                sr.company_name_english,
                ss.store_name_english AS supplier_store,
                ss.contact_person_name,
                ss.contact_person_mobile,
                ss.email

            FROM order_header oh

            JOIN supplier_registration sr
              ON sr.supplier_id = oh.supplier_id

            LEFT JOIN supplier_store_registration ss
              ON ss.store_id = oh.supplier_id

            WHERE oh.restaurant_id = %s
            ORDER BY oh.order_date DESC
        """, (restaurant_id,))

        orders = cur.fetchall()

        audit_read(restaurant_id, "orders")

        return jsonify(orders), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()



# ======================================================
# 4. RESTAURANT INVOICES
# ======================================================
@restaurant_monitor_bp.route("/<int:restaurant_id>/invoices", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_invoices(restaurant_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                invoice_id,
                invoice_number,
                order_id,
                invoice_status,
                payment_status,
                subtotal_amount,
                tax_amount,
                discount_amount,
                grand_total,
                created_at
            FROM invoice_header
            WHERE restaurant_id = %s
            ORDER BY created_at DESC
        """, (restaurant_id,))

        audit_read(restaurant_id, "invoices")
        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

# ======================================================
# 6. RESTAURANT RECEIPTS LIST
# ======================================================
@restaurant_monitor_bp.route("/<int:restaurant_id>/receipts", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_receipts(restaurant_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                receipt_id,
                receipt_date,
                invoice_no,
                amount_received,
                payment_mode,
                payment_status
            FROM receipts
            WHERE restaurant_id = %s
            ORDER BY receipt_date DESC
        """, (restaurant_id,))

        receipts = cur.fetchall()

        return jsonify(receipts), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# ======================================================
# RESTAURANT - ADMIN VIEW ORDER DETAILS (SAME STRUCTURE)
# ======================================================
@restaurant_monitor_bp.route("/order/<order_id>", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_view_order(order_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                -- ORDER
                oh.order_id,
                oh.order_date,
                oh.expected_delivery_date,
                oh.status,
                oh.payment_status,
                oh.total_amount,
                oh.remarks,

                -- SUPPLIER
                sr.company_name_english AS supplier_company,
                ss.store_name_english AS supplier_store_name,
                ss.contact_person_name AS supplier_contact_person,
                ss.contact_person_mobile AS supplier_contact_mobile,
                ss.email AS supplier_email,
                ss.shop_no AS supplier_shop_no,
                ss.building AS supplier_building,
                ss.street AS supplier_street,
                ss.zone AS supplier_zone,
                ss.city AS supplier_city,
                ss.country AS supplier_country,

                -- RESTAURANT
                rr.restaurant_name_english,
                rs.store_name_english,
                rs.contact_person_name,
                rs.contact_person_mobile,
                rs.email,
                rs.street,
                rs.zone,
                rs.building,
                rs.shop_no,
                rs.city,
                rs.country

            FROM order_header oh

            JOIN supplier_registration sr
                ON sr.supplier_id = oh.supplier_id

            LEFT JOIN supplier_store_registration ss
                ON ss.supplier_id = oh.supplier_id

            JOIN restaurant_registration rr
                ON rr.restaurant_id = oh.restaurant_id

            LEFT JOIN restaurant_store_registration rs
                ON rs.restaurant_id = oh.restaurant_id

            WHERE oh.order_id = %s
        """, (order_id,))

        header = cur.fetchone()
        if not header:
            return jsonify({"error": "Order not found"}), 404

        # ITEMS
        cur.execute("""
            SELECT
                p.product_name_english,
                oi.quantity,
                oi.price_per_unit,
                oi.discount,
                oi.total_amount
            FROM order_items oi
            LEFT JOIN product_management p
                ON p.product_id = oi.product_id
            WHERE oi.order_id = %s
            ORDER BY oi.item_id
        """, (order_id,))
        items = cur.fetchall()

        # TIMELINE
        cur.execute("""
            SELECT
                status,
                changed_by_role,
                changed_at
            FROM order_status_history
            WHERE order_id = %s
            ORDER BY changed_at ASC
        """, (order_id,))
        timeline = cur.fetchall()

        return jsonify({
            "header": header,
            "items": items,
            "timeline": timeline
        }), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()










# ======================================================
# 7. ADMIN VIEW INVOICE DETAILS (FULL — SAME AS SUPPLIER)
# ======================================================
@restaurant_monitor_bp.route("/invoice/<invoice_id>", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def admin_view_invoice(invoice_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # HEADER
        cur.execute("""
            SELECT
                ih.invoice_id,
                ih.invoice_number,
                ih.order_id,
                ih.invoice_date,
                ih.invoice_status,
                ih.payment_status,
                ih.subtotal_amount,
                ih.discount_amount,
                ih.tax_amount,
                ih.grand_total,

                ih.supplier_id,
                ih.supplier_store_id,
                ih.restaurant_id,
                ih.restaurant_store_id,

                ih.supplier_address,
                ih.restaurant_address
            FROM invoice_header ih
            WHERE ih.invoice_id = %s
        """, (invoice_id,))

        header = cur.fetchone()
        if not header:
            return jsonify({"error": "Invoice not found"}), 404

        # SUPPLIER STORE
        supplier = {}
        if header["supplier_store_id"]:
            cur.execute("""
                SELECT
                    store_name_english,
                    contact_person_name,
                    contact_person_mobile,
                    email
                FROM supplier_store_registration
                WHERE store_id = %s
            """, (header["supplier_store_id"],))
            supplier = cur.fetchone() or {}

        # RESTAURANT STORE
        restaurant = {}
        if header["restaurant_store_id"]:
            cur.execute("""
                SELECT
                    restaurant_name,
                    contact_person_name,
                    contact_person_mobile,
                    email
                FROM restaurant_store_registration
                WHERE store_id = %s
            """, (header["restaurant_store_id"],))
            restaurant = cur.fetchone() or {}

        # ITEMS
        cur.execute("""
            SELECT
                product_name_english,
                quantity,
                price_per_unit,
                discount,
                total_amount
            FROM invoice_items
            WHERE invoice_id = %s
            ORDER BY invoice_item_id
        """, (invoice_id,))
        items = cur.fetchall()

        return jsonify({
            "header": header,
            "supplier": supplier,
            "restaurant": restaurant,
            "items": items,
            "payments": []
        }), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
        
# ======================================================
# 7. ADMIN VIEW RESTAURANT RECEIPT DETAILS
# ======================================================
@restaurant_monitor_bp.route("/receipt/<int:receipt_id>", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def admin_view_restaurant_receipt(receipt_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ===============================
        # RECEIPT HEADER
        # ===============================
        cur.execute("""
            SELECT *
            FROM receipts
            WHERE receipt_id = %s
        """, (receipt_id,))

        header = cur.fetchone()

        if not header:
            return jsonify({"error": "Receipt not found"}), 404


        # ===============================
        # SUPPLIER DETAILS
        # ===============================
        supplier = {}

        if header.get("supplier_id"):
            cur.execute("""
                SELECT
                    supplier_name,
                    store_name_english,
                    contact_person_name,
                    contact_person_mobile,
                    email,
                    shop_no,
                    building,
                    street,
                    city
                FROM supplier_store_registration
                WHERE supplier_id = %s
                LIMIT 1
            """, (header["supplier_id"],))

            supplier = cur.fetchone() or {}


        # ===============================
        # RESTAURANT DETAILS
        # ===============================
        restaurant = {}

        if header.get("restaurant_id"):
            cur.execute("""
                SELECT
                    restaurant_name,
                    store_name_english,
                    contact_person_name,
                    contact_person_mobile,
                    email,
                    shop_no,
                    building,
                    street,
                    city
                FROM restaurant_store_registration
                WHERE restaurant_id = %s
                LIMIT 1
            """, (header["restaurant_id"],))

            restaurant = cur.fetchone() or {}


        # ===============================
        # RECEIPT ITEMS (FROM INVOICE)
        # ===============================
        items = []

        if header.get("invoice_no"):

            cur.execute("""
                SELECT invoice_id
                FROM invoice_header
                WHERE invoice_number = %s
                LIMIT 1
            """, (header["invoice_no"],))

            invoice = cur.fetchone()

            if invoice:

                cur.execute("""
                    SELECT
                        product_name_english,
                        quantity,
                        price_per_unit,
                        discount,
                        total_amount
                    FROM invoice_items
                    WHERE invoice_id = %s
                    ORDER BY invoice_item_id
                """, (invoice["invoice_id"],))

                items = cur.fetchall()


        # ===============================
        # FINAL RESPONSE
        # ===============================
        return jsonify({
            "header": header,
            "supplier": supplier,
            "restaurant": restaurant,
            "items": items
        }), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# ======================================================
# 5. RESTAURANT ACTIVITY
# ======================================================
@restaurant_monitor_bp.route("/<int:restaurant_id>/activity", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_activity(restaurant_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                audit_id,
                action,
                entity_type,
                entity_id,
                created_at
            FROM platform_audit_log
            WHERE actor_type = 'RESTAURANT'
              AND linked_id = %s
            ORDER BY created_at DESC
            LIMIT 100
        """, (restaurant_id,))

        audit_read(restaurant_id, "activity")
        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

          
               # ======================================================
# RESTAURANT ORDER ISSUES LIST
# ======================================================
@restaurant_monitor_bp.route("/<int:restaurant_id>/order-issues", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_order_issues(restaurant_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                ir.issue_report_id,
                ir.order_id,
                ir.issue_type,
                ir.status,
                ir.reported_at,
                ir.restaurant_id,
                rr.restaurant_name_english AS restaurant_name,
                ir.supplier_id,
                sr.company_name_english AS supplier_name

            FROM order_issue_reports ir

            LEFT JOIN restaurant_registration rr
            ON rr.restaurant_id = ir.restaurant_id

            LEFT JOIN supplier_registration sr
            ON sr.supplier_id = ir.supplier_id

            WHERE ir.restaurant_id = %s
            ORDER BY ir.reported_at DESC
        """, (restaurant_id,))

        issues = cur.fetchall()

        return jsonify(issues), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@restaurant_monitor_bp.route("/<int:restaurant_id>/products", methods=["GET"])
@require_admin("MONITOR_RESTAURANTS")
def restaurant_products(restaurant_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                product_id,
                product_name_english,
                product_status,
                price_per_unit,
                stock_availability
            FROM product_management
            WHERE restaurant_id = %s
        """, (restaurant_id,))

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()