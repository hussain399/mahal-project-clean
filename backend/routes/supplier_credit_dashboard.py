from flask import Blueprint, jsonify, g, send_file
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection
from routes.supplier_guard import require_supplier
import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
supplier_credit_bp = Blueprint(
    "supplier_credit_bp",
    __name__,
    url_prefix="/api/supplier/credit"
)


# =========================================================
# CREDIT SUMMARY
# =========================================================
@supplier_credit_bp.route("/summary", methods=["GET"])
@require_supplier()
def credit_summary():

    supplier_id = g.supplier["supplier_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount),0) AS total_amount,
        COALESCE(SUM(supplier_paid_amount),0) AS paid_amount,
        COALESCE(SUM(total_amount - supplier_paid_amount),0) AS due_amount
    FROM order_header
    WHERE supplier_id = %s
    AND LOWER(payment_method) = 'credit'
    """, (supplier_id,))

    data = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(data)


# =========================================================
# CREDIT ORDERS
# =========================================================
@supplier_credit_bp.route("/orders", methods=["GET"])
@require_supplier()
def supplier_orders():

    supplier_id = g.supplier["supplier_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            oh.order_id,
            oh.order_date,
            oh.total_amount,
            oh.supplier_paid_amount,
            oh.supplier_due_amount,
            oh.supplier_payment_status,
            r.restaurant_name_english
        FROM order_header oh
        JOIN restaurant_registration r
            ON r.restaurant_id = oh.restaurant_id
        WHERE oh.supplier_id = %s
        AND LOWER(oh.payment_method) = 'credit'
        ORDER BY oh.order_date DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)


# =========================================================
# PAYMENT HISTORY
# =========================================================
@supplier_credit_bp.route("/payments", methods=["GET"])
@require_supplier()
def payment_history():

    supplier_id = g.supplier["supplier_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            sp.payment_id,
            sp.amount,
            sp.payment_mode,
            sp.reference_no,
            sp.remarks,
            sp.order_ids,
            sp.created_at,
            sp.receipt_filename,
            au.name AS paid_by
        FROM supplier_payments sp
        LEFT JOIN admin_users au
            ON au.admin_id = sp.created_by_admin
        WHERE sp.supplier_id = %s
        ORDER BY sp.created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    for r in rows:
        if isinstance(r["order_ids"], str):
            r["order_ids"] = json.loads(r["order_ids"])

    cur.close()
    conn.close()

    return jsonify(rows)


# =========================================================
# RECEIPT DOWNLOAD
# =========================================================
@supplier_credit_bp.route("/receipt/<int:payment_id>", methods=["GET"])
@require_supplier()
def download_receipt(payment_id):

    supplier_id = g.supplier["supplier_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            receipt_file,
            receipt_filename,
            receipt_mimetype
        FROM supplier_payments
        WHERE payment_id = %s
        AND supplier_id = %s
    """, (payment_id, supplier_id))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row["receipt_file"]:
        return jsonify({"error": "Receipt not found"}), 404

    return send_file(
        io.BytesIO(row["receipt_file"]),
        mimetype=row["receipt_mimetype"],
        as_attachment=True,
        download_name=row["receipt_filename"]
    )

# =========================================================
# PAYMENT PDF (SUPPLIER DOWNLOAD)
# =========================================================
@supplier_credit_bp.route("/payment-pdf/<int:payment_id>", methods=["GET"])
@require_supplier()
def payment_pdf(payment_id):

    supplier_id = g.supplier["supplier_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- PAYMENT ----------------
    cur.execute("""
        SELECT sp.*, s.company_name_english
        FROM supplier_payments sp
        JOIN supplier_registration s
            ON s.supplier_id = sp.supplier_id
        WHERE sp.payment_id = %s
        AND sp.supplier_id = %s
    """, (payment_id, supplier_id))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Not found"}), 404


    # ---------------- LOAD ORDERS ----------------
    orders = row["order_ids"]

    if isinstance(orders, str):
        orders = json.loads(orders)

    order_rows = []

    previous_due = 0
    remaining_due = 0

    for oid in orders:

        cur.execute("""
            SELECT
                order_id,
                total_amount,
                COALESCE(supplier_due_amount,0) AS due
            FROM order_header
            WHERE order_id = %s
        """, (oid,))

        o = cur.fetchone()

        if not o:
            continue

        total_amt = float(o["total_amount"] or 0)
        due_amt = float(o["due"] or 0)

        paid_amt = total_amt - due_amt

        previous_due += total_amt
        remaining_due += due_amt

        order_rows.append([
            o["order_id"],
            f"{total_amt:.2f}",
            f"{paid_amt:.2f}",
            f"{due_amt:.2f}"
        ])

    # ---------------- PDF ----------------
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    elements = []

    # HEADER
    header_data = [
        ["MAHAL"],
        ["SUPPLIER PAYMENT RECEIPT"]
    ]

    header_table = Table(header_data, colWidths=[500])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#2E86C1")),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 16),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 10)
    ]))

    elements.append(header_table)
    elements.append(Spacer(1,25))

    # INFO
    info_data = [
        ["Supplier", row["company_name_english"]],
        ["Payment ID", str(row["payment_id"])],
        ["Date", str(row["created_at"])[:19]],
        ["Payment Mode", row["payment_mode"]],
        ["Reference No", row["reference_no"] or "-"]
    ]

    info_table = Table(info_data, colWidths=[180,320])

    info_table.setStyle(TableStyle([
        ("GRID",(0,0),(-1,-1),0.5,colors.grey),
        ("BACKGROUND",(0,0),(0,-1),colors.whitesmoke)
    ]))

    elements.append(info_table)
    elements.append(Spacer(1,25))

    # ORDERS TABLE
    elements.append(Paragraph("<b>Orders Paid</b>", styles["Heading3"]))
    elements.append(Spacer(1,10))

    table_data = [["Order ID","Total","Paid","Remaining"]] + order_rows

    orders_table = Table(table_data, colWidths=[120,120,120,120])

    orders_table.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#D6EAF8")),
        ("GRID",(0,0),(-1,-1),0.5,colors.grey),
        ("ALIGN",(1,1),(-1,-1),"RIGHT")
    ]))

    elements.append(orders_table)
    elements.append(Spacer(1,30))

    # TOTALS
    totals = [
        ["Total Due", f"QAR {previous_due:.2f}"],
        ["Amount Paid", f"QAR {float(row['amount']):.2f}"],
        ["Remaining Due", f"QAR {remaining_due:.2f}"]
    ]

    totals_table = Table(totals, colWidths=[250,200])

    totals_table.setStyle(TableStyle([
        ("GRID",(0,0),(-1,-1),1,colors.black),
        ("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#F9E79F"))
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1,40))

    doc.build(elements)

    buffer.seek(0)

    cur.close()
    conn.close()

    return send_file(
        buffer,
        download_name=f"SupplierPayment_{payment_id}.pdf",
        mimetype="application/pdf"
    )