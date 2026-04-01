from flask_mail import Message
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from app import mail


# ===============================
# LOW STOCK EMAIL HELPER
# ===============================
def send_low_stock_email(supplier_id, product_id, stock):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT contact_person_email, company_name_english
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (supplier_id,))
        supplier = cur.fetchone()

        cur.execute("""
            SELECT product_name_english
            FROM product_management
            WHERE product_id = %s
        """, (product_id,))
        product = cur.fetchone()

        cur.close()
        conn.close()

        if not supplier or not supplier["contact_person_email"]:
            return

        msg = Message(
            subject="⚠️ Low Stock Alert",
            recipients=[supplier["contact_person_email"]],
            body=f"""
LOW STOCK ALERT

Company: {supplier["company_name_english"]}
Product: {product["product_name_english"]}
Remaining Stock: {stock}

Please restock soon.
— Mahal Inventory System
"""
        )

        mail.send(msg)   # ✅ NO app_context needed

    except Exception as e:
        print("❌ Low stock email failed:", e)


# ===============================
# OUT OF STOCK EMAIL HELPER
# ===============================
def send_out_of_stock_email(supplier_id, product_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT contact_person_email, company_name_english
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (supplier_id,))
        supplier = cur.fetchone()

        cur.execute("""
            SELECT product_name_english
            FROM product_management
            WHERE product_id = %s
        """, (product_id,))
        product = cur.fetchone()

        cur.close()
        conn.close()

        if not supplier or not supplier["contact_person_email"]:
            return

        msg = Message(
            subject="🚨 OUT OF STOCK ALERT",
            recipients=[supplier["contact_person_email"]],
            body=f"""
OUT OF STOCK ALERT

Company: {supplier["company_name_english"]}
Product: {product["product_name_english"]}

⚠️ This product is COMPLETELY OUT OF STOCK.
Immediate restocking is required.

— Mahal Inventory System
"""
        )

        mail.send(msg)

    except Exception as e:
        print("❌ Out of stock email failed:", e)