
from flask import Blueprint, jsonify, request, g
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action

supplier_monitor_bp = Blueprint(
        "supplier_monitor_bp",
        __name__,
        url_prefix="/api/v1/admin/monitor/supplier"
    )

    # ======================================================
    # INTERNAL AUDIT
    # ======================================================
def audit_read(supplier_id, section):
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="READ_ACCESS",
            entity_type="supplier_monitor",
            entity_id=str(supplier_id),
            new_value={"section": section},
            ip_address=request.remote_addr
        )

    # ======================================================
    # 0. LIST ACTIVE APPROVED SUPPLIERS (ENTRY POINT)
    # ======================================================
@supplier_monitor_bp.route("/list", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def list_suppliers():
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
           SELECT DISTINCT ON (sr.supplier_id)
    sr.supplier_id,
    sr.company_name_english,
    sr.approval_status,
    sr.created_at AS registered_at,

    u.user_id,
    u.username,
    u.status AS user_status   -- 👈 yahi use karna hai frontend me

FROM supplier_registration sr
JOIN users u
  ON u.linked_id = sr.supplier_id
 AND u.role = 'supplier'

WHERE LOWER(sr.approval_status) = 'approved'
ORDER BY sr.supplier_id, u.created_at ASC
        """)

        return jsonify(cur.fetchall()), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()
# ======================================================
# 1. SUPPLIER SUMMARY (BRANCH-WISE STORES)
# ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/summary", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_summary(supplier_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ================= SUPPLIER =================
        cur.execute("""
            SELECT *
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (supplier_id,))
        supplier = cur.fetchone()

        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

        # ================= BRANCHES =================
        cur.execute("""
            SELECT *
            FROM supplier_branch_registration
            WHERE supplier_id = %s
            ORDER BY branch_id ASC
        """, (supplier_id,))

        branches = cur.fetchall()

        # ================= STORES UNDER EACH BRANCH =================
        for branch in branches:
            cur.execute("""
                SELECT *
                FROM supplier_store_registration
                WHERE supplier_id = %s
                  AND branch_name = %s
                ORDER BY store_id ASC
            """, (supplier_id, branch["branch_name_english"]))

            branch["stores"] = cur.fetchall()

        supplier["branches"] = branches

        audit_read(supplier_id, "summary")

        return jsonify(supplier), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()

@supplier_monitor_bp.route("/<int:supplier_id>/products", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_products(supplier_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                product_id,
                product_name_english,
                price_per_unit,
                    
                stock_availability,
                expiry_date,
                CASE 
                    WHEN flag = 'A' THEN 'Active'
                    ELSE 'Deactive'
                END AS flag
            FROM product_management
            WHERE supplier_id = %s
            ORDER BY updated_at DESC
        """, (supplier_id,))

        products = cur.fetchall()

        print("Fetched Products:", products)

        audit_read(supplier_id, "products")
        return jsonify(products), 200

    finally:
        if cur: cur.close()
        if conn: conn.close()



# ======================================================
# 3. SUPPLIER ORDERS (LIST)
# ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/orders", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_orders(supplier_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # SIMPLE ORDER LIST (NO DUPLICATES)
        cur.execute("""
            SELECT
                order_id,
                status,
                total_amount,
                order_date
            FROM order_header
            WHERE supplier_id = %s
            ORDER BY order_date DESC
        """, (supplier_id,))

        orders = cur.fetchall()

        audit_read(supplier_id, "orders")

        return jsonify(orders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
    # ======================================================
    # 4. SUPPLIER INVOICES
    # ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/invoices", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_invoices(supplier_id):
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
                    grand_total,
                    created_at
                FROM invoice_header
                WHERE supplier_id = %s
                ORDER BY created_at DESC
            """, (supplier_id,))

            audit_read(supplier_id, "invoices")
            return jsonify(cur.fetchall()), 200

        finally:
            if cur: cur.close()
            if conn: conn.close()


# ======================================================
# 6. SUPPLIER RECEIPTS LIST
# ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/receipts", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_receipts(supplier_id):

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
                reference_number,
                payment_status,
                grand_total
            FROM receipts
            WHERE supplier_id = %s
            ORDER BY receipt_date DESC
        """, (supplier_id,))

        receipts = cur.fetchall()

        return jsonify(receipts), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    # ======================================================
    # 5. SUPPLIER ACTIVITY (AUDIT)
    # ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/activity", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_activity(supplier_id):
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
                    metadata,
                    ip_address,
                    created_at
                FROM platform_audit_log
                WHERE actor_type = 'SUPPLIER'
                AND linked_id = %s
                ORDER BY created_at DESC
                LIMIT 100
            """, (supplier_id,))

            audit_read(supplier_id, "activity")
            return jsonify(cur.fetchall()), 200

        finally:
            if cur: cur.close()
            if conn: conn.close()

    # ======================================================
    # 6. ADMIN VIEW ORDER DETAILS (FULL READ-ONLY)
    # ======================================================
@supplier_monitor_bp.route("/order/<order_id>", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def admin_view_order(order_id):
        conn = cur = None
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # ===============================
            # ORDER HEADER + RESTAURANT DETAILS
            # ===============================
            cur.execute("""
        SELECT
        oh.order_id,
        oh.order_date,
        oh.expected_delivery_date,
        oh.status,
        oh.payment_status,
        oh.total_amount,
        oh.remarks,

        rr.restaurant_name_english AS restaurant_name,

        rs.branch_name,
        rs.store_name_english,
        rs.contact_person_name,
        rs.contact_person_mobile,
        rs.email,
        rs.street,
        rs.zone,
        rs.building,
        rs.shop_no

    FROM order_header oh

    JOIN restaurant_registration rr
    ON rr.restaurant_id = oh.restaurant_id

    LEFT JOIN restaurant_store_registration rs
    ON rs.restaurant_id = oh.restaurant_id

    WHERE oh.order_id = %s;
            """, (order_id,))

            header = cur.fetchone()
            if not header:
                return jsonify({"error": "Order not found"}), 404

            # ===============================
            # ORDER ITEMS
            # ===============================
            cur.execute("""
                SELECT
                    product_id,
                    product_name_english,
                    quantity,
                    price_per_unit,
                    discount,
                    total_amount
                FROM order_items
                WHERE order_id = %s
                ORDER BY item_id
            """, (order_id,))
            items = cur.fetchall()

            # ===============================
            # ORDER TIMELINE
            # ===============================
            cur.execute("""
                SELECT
                    status,
                    changed_by_role,
                    changed_by_id,
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
# CANCEL ORDER
# ======================================================
@supplier_monitor_bp.route("/order/<order_id>/cancel", methods=["POST"])
@require_admin("MONITOR_SUPPLIERS")
def cancel_order(order_id):

    reason = request.json.get("reason", "Admin cancelled")

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT status FROM order_header WHERE order_id=%s", (order_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Order not found"}), 404

        if row["status"] in ("DELIVERED", "CANCELLED"):
            return jsonify({"error": "Already completed"}), 400

        cur.execute("""
            UPDATE order_header
            SET status='CANCELLED'
            WHERE order_id=%s
        """, (order_id,))

        conn.commit()

        return jsonify({"success": True})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# FORCE COMPLETE
# ======================================================
@supplier_monitor_bp.route("/order/<order_id>/complete", methods=["POST"])
@require_admin("MONITOR_SUPPLIERS")
def complete_order(order_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE order_header
            SET status='DELIVERED'
            WHERE order_id=%s
        """, (order_id,))

        conn.commit()

        return jsonify({"success": True})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# UPDATE STATUS
# ======================================================
@supplier_monitor_bp.route("/order/<order_id>/update-status", methods=["POST"])
@require_admin("MONITOR_SUPPLIERS")
def update_status(order_id):

    status = request.json.get("status")

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            UPDATE order_header
            SET status=%s
            WHERE order_id=%s
        """, (status, order_id))

        conn.commit()

        return jsonify({"success": True})

    finally:
        if cur: cur.close()
        if conn: conn.close()



# ======================================================
# 7. ADMIN VIEW INVOICE DETAILS (FULL READ-ONLY)
# ======================================================
@supplier_monitor_bp.route("/invoice/<invoice_id>", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def admin_view_invoice(invoice_id):
    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ===============================
        # INVOICE HEADER
        # ===============================
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

        # ===============================
        # SUPPLIER STORE FETCH
        # ===============================
        supplier = {}

        if header.get("supplier_store_id"):
            cur.execute("""
                SELECT
                    supplier_name,
                    store_name_english,
                    contact_person_name,
                    contact_person_mobile,
                    email AS contact_person_email,
                    shop_no,
                    building,
                    street,
                    city
                FROM supplier_store_registration
                WHERE store_id = %s
            """, (header["supplier_store_id"],))

            supplier = cur.fetchone() or {}

        # ===============================
        # RESTAURANT STORE FETCH (FIXED)
        # ===============================
        restaurant = {}

        if header.get("restaurant_store_id"):
            cur.execute("""
                SELECT
                    restaurant_name,
                    store_name_english AS store_name,
                    contact_person_name,
                    contact_person_mobile,
                    email AS contact_person_email,
                    shop_no,
                    building,
                    street,
                    city
                FROM restaurant_store_registration
                WHERE store_id = %s
            """, (header["restaurant_store_id"],))

            restaurant = cur.fetchone() or {}

        # ===============================
        # INVOICE ITEMS
        # ===============================
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

        # ===============================
        # FINAL RESPONSE
        # ===============================
        return jsonify({
            "header": header,
            "supplier": supplier,
            "restaurant": restaurant,
            "items": items,
            "payments": []
        }), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
                
# ======================================================
# 8. ADMIN VIEW RECEIPT DETAILS (FULL READ-ONLY)
# ======================================================
@supplier_monitor_bp.route("/receipt/<int:receipt_id>", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def admin_view_receipt(receipt_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ===============================
        # RECEIPT HEADER
        # ===============================
        cur.execute("""
            SELECT
                receipt_id,
                receipt_date,
                invoice_no,
                restaurant_id,
                restaurant_branch_name_english,
                restaurant_store_name_english,
                supplier_id,
                branch_name_english,
                store_name_english,
                amount_received,
                payment_mode,
                reference_number,
                remarks,
                payment_status,
                grand_total,
                created_at
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
        # FINAL RESPONSE
        # ===============================
        return jsonify({
            "header": header,
            "supplier": supplier,
            "restaurant": restaurant
        }), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# ======================================================
# SUPPLIER ORDER ISSUES LIST
# ======================================================
@supplier_monitor_bp.route("/<int:supplier_id>/order-issues", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def supplier_order_issues(supplier_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
SELECT
    ir.issue_report_id,
    ir.order_id,
    ir.restaurant_id,
    rr.restaurant_name_english AS restaurant_name,
    ir.issue_type,
    ir.status,
    ir.reported_at
FROM order_issue_reports ir

LEFT JOIN restaurant_registration rr
ON rr.restaurant_id = ir.restaurant_id

WHERE ir.supplier_id = %s
ORDER BY ir.reported_at DESC
""", (supplier_id,))

        issues = cur.fetchall()

        return jsonify(issues), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# SUPPLIER ORDER ISSUE DETAILS
# ======================================================
@supplier_monitor_bp.route("/order-issue/<issue_report_id>", methods=["GET"])
@require_admin("MONITOR_SUPPLIERS")
def admin_view_supplier_issue(issue_report_id):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ISSUE HEADER
        cur.execute("""
            SELECT *
            FROM order_issue_reports
            WHERE issue_report_id = %s
        """, (issue_report_id,))

        issue = cur.fetchone()

        if not issue:
            return jsonify({"error": "Issue not found"}), 404


        # ISSUE PRODUCTS
        cur.execute("""
            SELECT
                product_id,
                product_name
            FROM order_issue_products
            WHERE issue_report_id = %s
        """, (issue_report_id,))

        products = cur.fetchall()

        return jsonify({
            "issue": issue,
            "products": products
        }), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            # ======================================================
# ADMIN TOGGLE PRODUCT STATUS
# ======================================================
@supplier_monitor_bp.route("/product/<int:product_id>/toggle", methods=["POST"])
@require_admin("MONITOR_SUPPLIERS")
def toggle_product(product_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Get current flag
        cur.execute("""
            SELECT flag FROM product_management
            WHERE product_id = %s
        """, (product_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Product not found"}), 404

        current_flag = row["flag"]

        # Toggle logic
        new_flag = "D" if current_flag == "A" else "A"

        cur.execute("""
            UPDATE product_management
            SET flag = %s
            WHERE product_id = %s
        """, (new_flag, product_id))

        conn.commit()

        return jsonify({
            "success": True,
            "new_flag": new_flag
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()