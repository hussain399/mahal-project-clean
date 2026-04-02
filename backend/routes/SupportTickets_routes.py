import jwt
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection

support_bp = Blueprint(
    "support_bp",
    __name__,
    url_prefix="/api/support"
)

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"


# =====================================================
# TOKEN DECODE (same token as auth_routes)
# =====================================================

def decode_token(token):

    try:

        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        return decoded

    except Exception:
        return None


# =====================================================
# PRIORITY DECISION
# =====================================================

def decide_priority(subject):

    HIGH = {
        "Payment & Settlement Issue",
        "Account / KYC Issue",
        "Invoice / Billing Issue"
    }

    return "high" if subject in HIGH else "normal"


# =====================================================
# GET SUPPORT CATEGORIES
# =====================================================

@support_bp.route("/categories", methods=["GET"])
def get_categories():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])

    if not user:
        return jsonify({"error": "Invalid token"}), 401

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT category_id, name
            FROM support_categories
            WHERE active = TRUE
            AND role_scope IN (%s, 'both')
            ORDER BY name
        """, (user["role"],))

        return jsonify({
            "success": True,
            "categories": cur.fetchall()
        })

    finally:

        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# CREATE TICKET WITH DB ATTACHMENT
# =====================================================

@support_bp.route("/ticket", methods=["POST"])
def create_ticket():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])

    if not user:
        return jsonify({"error": "Invalid token"}), 401


    subject = request.form.get("subject")
    message = request.form.get("message")
    file = request.files.get("attachment")


    if not subject or not message:
        return jsonify({"error": "Subject and message required"}), 400


    priority = decide_priority(subject)

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)


        # CREATE TICKET

        cur.execute("""
            INSERT INTO support_tickets
            (
                source_role,
                source_id,
                user_id,
                subject,
                priority,
                original_priority,
                status
            )
            VALUES (%s,%s,%s,%s,%s,%s,'open')
            RETURNING ticket_id
        """, (
            user["role"],
            user["linked_id"],
            user["user_id"],
            subject,
            priority,
            priority
        ))

        ticket_id = cur.fetchone()["ticket_id"]


        # INSERT MESSAGE

        cur.execute("""
            INSERT INTO support_messages
            (
                ticket_id,
                sender_role,
                sender_id,
                message
            )
            VALUES (%s,%s,%s,%s)
            RETURNING message_id
        """, (
            ticket_id,
            user["role"],
            user["user_id"],
            message
        ))

        message_id = cur.fetchone()["message_id"]


        # STORE FILE IN DATABASE (BYTEA)
# STORE FILE METADATA ONLY

        if file:

            cur.execute("""
                INSERT INTO support_attachments
                (
                    ticket_id,
                    message_id,
                    uploaded_by_role,
                    file_name,
                    file_type,
                    file_size,
                    file_path
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                ticket_id,
                message_id,
                user["role"],
                file.filename,
                file.content_type,
                file.content_length or 0,
                file.filename
            ))



        return jsonify({
            "success": True,
            "ticket_id": ticket_id,
            "priority": priority
        })


    except Exception as e:

        conn.rollback()

        return jsonify({
            "error": str(e)
        }), 500


    finally:

        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# MY TICKETS
# =====================================================

@support_bp.route("/my-tickets", methods=["GET"])
def my_tickets():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])

    if not user:
        return jsonify({"error": "Invalid token"}), 401


    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)


        cur.execute("""
            SELECT
                ticket_id,
                subject,
                original_priority,
                status,
                created_at,
                closed_at
            FROM support_tickets
            WHERE user_id=%s
            ORDER BY created_at DESC
        """, (user["user_id"],))


        return jsonify({
            "success": True,
            "tickets": cur.fetchall()
        })


    finally:

        if cur: cur.close()
        if conn: conn.close()