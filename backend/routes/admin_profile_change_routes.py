from flask import Blueprint, jsonify, request,g
from db import get_db_connection
import json
from psycopg2.extras import RealDictCursor
from routes.admin_guard import require_admin
from flask_cors import CORS
from flask import current_app
from routes.notifications import send_mail, send_admin_notification
import base64

FIELD_MAP = {
    "supplier": {
        "org": {
            "company_name_english": "company_name_english",
            "contact_person_name": "contact_person_name",
            "contact_person_email": "contact_person_email",
            "contact_person_mobile": "contact_person_mobile",
            "city": "city",
            "country": "country",
            "cr_number": "cr_number",
            "cr_expiry_date": "cr_expiry_date",
            "computer_card_number": "computer_card_number",
            "computer_card_expiry_date": "computer_card_expiry_date",
            "signing_authority_name": "signing_authority_name",
            "sponsor_name": "sponsor_name",
            "trade_license_name": "trade_license_name",
            "vat_tax_number": "vat_tax_number",
            "category": "category",
            "brand_name": "brand_name"
        },

        "address": {
            "address": "address",
            "street": "street",
            "zone": "zone",
            "area": "area",
            "city": "city",
            "country": "country"
        },

        "bank": {
            "bank_name": "bank_name",
            "iban": "iban",
            "account_holder_name": "account_holder_name",
            "bank_branch": "bank_branch",
            "swift_code": "swift_code"
        },

        "files": {
            "upload_trade_license_copy": "upload_trade_license_copy",
            "upload_vat_certificates_copy": "upload_vat_certificates_copy",
            "upload_cr_company": "upload_cr_company",
            "upload_computer_card_copy": "upload_computer_card_copy",
            "upload_bank_letter": "upload_bank_letter",
            "upload_company_logo": "upload_company_logo",
            "certificates": "certificates"
        }
    },

    "restaurant": {
        "org": {
            "restaurant_name_english": "restaurant_name_english",
            "restaurant_email_address": "restaurant_email_address",
            "contact_person_name": "contact_person_name",
            "contact_person_mobile": "contact_person_mobile",
            "contact_person_email": "contact_person_email",
            "cr_number": "cr_number",
            "cr_expiry_date": "cr_expiry_date",
            "computer_card_number": "computer_card_number",
            "computer_card_expiry_date": "computer_card_expiry_date",
            "signing_authority_name": "signing_authority_name",
            "sponsor_name": "sponsor_name",
            "trade_license_name": "trade_license_name",
            "vat_tax_number": "vat_tax_number"
        },

        "address": {
            "address": "address",
            "street": "street",
            "zone": "zone",
            "area": "area",
            "city": "city",
            "country": "country"
        },

        "bank": {
            "bank_name": "bank_name",
            "iban": "iban",
            "account_holder_name": "account_holder_name",
            "bank_branch": "bank_branch",
            "swift_code": "swift_code"
        },

        "files": {
            "upload_cr_copy": "upload_cr_copy",
            "upload_computer_card_copy": "upload_computer_card_copy",
            "upload_trade_license_copy": "upload_trade_license_copy",
            "upload_vat_certificate_copy": "upload_vat_certificate_copy",
            "upload_food_safety_certificate": "upload_food_safety_certificate",
            "upload_company_logo": "upload_company_logo"
        }
    }
}

FIELD_MAP["supplier"]["branch"] = {
    "branch_name_english": "branch_name_english",
    "branch_manager_name": "branch_manager_name",
    "contact_number": "contact_number",
    "email": "email",
    "street": "street",
    "zone": "zone",
    "building": "building",
    "office_no": "office_no",
    "city": "city",
    "country": "country",
    "branch_license": "branch_license"
}

FIELD_MAP["supplier"]["store"] = {
    "store_name_english": "store_name_english",
    "contact_person_name": "contact_person_name",
    "contact_person_mobile": "contact_person_mobile",
    "email": "email",
    "street": "street",
    "zone": "zone",
    "building": "building",
    "shop_no": "shop_no",
    "operating_hours": "operating_hours",
    "city": "city",
    "country": "country",
    "store_type": "store_type",
    "delivery_pickup_availability": "delivery_pickup_availability"
}

FIELD_MAP["restaurant"]["branch"] = {
    "branch_name_english": "branch_name_english",
    "branch_manager_name": "branch_manager_name",
    "contact_number": "contact_number",
    "email": "email",
    "street": "street",
    "zone": "zone",
    "building": "building",
    "office_number": "office_number",
    "city": "city",
    "country": "country"
}

FIELD_MAP["restaurant"]["store"] = {
    "store_name_english": "store_name_english",
    "contact_person_name": "contact_person_name",
    "contact_person_mobile": "contact_person_mobile",
    "email": "email",
    "street": "street",
    "zone": "zone",
    "building": "building",
    "shop_no": "shop_no",
    "operating_hours": "operating_hours",
    "city": "city",
    "country": "country"
}

FIELD_MAP["supplier"]["basic"] = {
    "company_name_english": "company_name_english",
    "contact_person_name": "contact_person_name",
    "contact_person_email": "contact_person_email",
    "contact_person_mobile": "contact_person_mobile",
    "city": "city",
    "country": "country"
}

FIELD_MAP["restaurant"]["basic"] = {
    "restaurant_name_english": "restaurant_name_english",
    "contact_person_name": "contact_person_name",
    "contact_person_email": "contact_person_email",
    "contact_person_mobile": "contact_person_mobile",
    "city": "city",
    "country": "country"
}

admin_changes_bp = Blueprint(
    "admin_changes_bp",
    __name__,
    url_prefix="/api/v1/admin/change-requests"
)

# ✅ THIS LINE FIXES YOUR ERROR
CORS(admin_changes_bp)

def serialize_value(v):
    if isinstance(v, (dict, list)):
        return json.dumps(v)
    return v

def get_entity_email(cur, role, entity_id):
    table = "supplier_registration" if role == "supplier" else "restaurant_registration"
    email_col = (
        "contact_person_email"
        if role == "supplier"
        else "restaurant_email_address"
    )

    cur.execute(
        f"SELECT {email_col} FROM {table} WHERE {role}_id=%s",
        (entity_id,)
    )
    row = cur.fetchone()
    return row[email_col] if row else None

def get_supplier_company_name(cur, supplier_id):
    cur.execute(
        "SELECT company_name_english FROM supplier_registration WHERE supplier_id=%s",
        (supplier_id,)
    )
    row = cur.fetchone()
    return row["company_name_english"] if row else None

def normalize_file_key(role, key):
    if role == "supplier":
        if key == "upload_cr_company":
            return "upload_cr_copy"
        if key == "upload_vat_certificates_copy":
            return "upload_vat_certificate_copy"
    return key

def get_existing_files(cur, role, entity_id):
    files = {}

    if role == "supplier":
        cur.execute("""
            SELECT
                upload_cr_company,
                upload_computer_card_copy,
                upload_trade_license_copy,
                upload_vat_certificates_copy,
                upload_company_logo,
                upload_bank_letter,
                certificates
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (entity_id,))
    else:
        cur.execute("""
            SELECT
                upload_cr_copy,
                upload_computer_card_copy,
                upload_trade_license_copy,
                upload_vat_certificate_copy,
                upload_food_safety_certificate,
                upload_company_logo
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (entity_id,))

    row = cur.fetchone()
    if not row:
        return files

    for key, value in row.items():
        if not value:
            continue

        normalized_key = normalize_file_key(role, key)

        # 🟢 CASE 1: RAW BYTEA (very old records)
        if isinstance(value, (bytes, bytearray, memoryview)):
            if isinstance(value, memoryview):
                value = value.tobytes()

            files[normalized_key] = {
                "content": base64.b64encode(value).decode("utf-8"),
                "mimetype": "application/octet-stream",
                "filename": normalized_key
            }

        # 🟢 CASE 2: JSON (new records)
        elif isinstance(value, str):
            try:
                data = json.loads(value)
                files[normalized_key] = {
                    "filename": data.get("filename"),
                    "mimetype": data.get("mimetype"),
                    "content": data.get("content")
                }
            except Exception:
                continue

    return files

# 🔥 NORMALIZE FILE KEYS (VERY IMPORTANT)
def normalize_file_keys(data, role):
    fixed = {}
    for k, v in data.items():
        nk = k

        if role == "supplier":
            if k == "upload_vat_certificates_copy":
                nk = "upload_vat_certificate_copy"
            if k == "upload_cr_company":
                nk = "upload_cr_copy"

            # 🔥 ADD THIS — frontend → backend alignment
            alias = {
                "crCopy": "upload_cr_copy",
                "compCardCopy": "upload_computer_card_copy",
                "tradeLicenseCopy": "upload_trade_license_copy",
                "vatCertificate": "upload_vat_certificate_copy",
                "companyLogo": "upload_company_logo",
                "bankLetter": "upload_bank_letter",
                "certificates": "certificates",
            }
            if k in alias:
                nk = alias[k]

        fixed[nk] = v
    return fixed


@admin_changes_bp.route("/pending", methods=["GET"])
@require_admin()   # <-- NEW AUTH
def get_pending_profile_changes():
    

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, role, entity_id, section, old_data, new_data, target_table, target_row_id, requested_at
        FROM profile_change_requests
        WHERE status='Pending'
        ORDER BY requested_at DESC
    """)

    files_cur = conn.cursor(cursor_factory=RealDictCursor)
    rows = cur.fetchall()

    for r in rows:
        if isinstance(r["new_data"], str):
            r["new_data"] = json.loads(r["new_data"])
        if isinstance(r["old_data"], str):
            r["old_data"] = json.loads(r["old_data"])

        # 🔥 ADD THIS LINE
        r["existing_files"] = get_existing_files(
            files_cur,
            r["role"],
            r["entity_id"]
        )

        r["new_data"] = normalize_file_keys(r["new_data"], r["role"])
        r["existing_files"] = normalize_file_keys(r["existing_files"], r["role"])

    files_cur.close()
    cur.close(); 
    conn.close()

    return jsonify({"status": True, "items": rows})

@admin_changes_bp.route("/<int:req_id>/approve", methods=["POST"])
@require_admin()   # <-- JWT auth
def approve_change_request(req_id):

    # 🔥 NEW PERMISSION GATE (ADD THIS IMMEDIATELY AFTER FUNCTION START)
    if g.admin["role"] != "SUPER_ADMIN":
        return jsonify({
            "error": "Forbidden",
            "reason": "Only Super Admin can approve"
        }), 403

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT role, entity_id, section, new_data, target_table, target_row_id
            FROM profile_change_requests
            WHERE id = %s AND status = 'Pending'
        """, (req_id,))
        req = cur.fetchone()

        if not req:
            return jsonify({"error": "Request not found"}), 404

        role = req["role"].lower()
        section = req["section"].lower()
        entity_id = req["entity_id"]
        data = req["new_data"]
        target_row_id = req["target_row_id"]

        # 🔥 VERY IMPORTANT
        if isinstance(data, str):
            data = json.loads(data)

        # 🔥 ONLY FILES SECTION
        if section == "files":
            role_map = FIELD_MAP.get(role, {})
            section_map = role_map.get("files", {})

            db_data = {}

            for k, v in data.items():
                if k in section_map:
                    db_data[section_map[k]] = serialize_value(v)

            if db_data:
                main_table = (
                    "supplier_registration"
                    if role == "supplier"
                    else "restaurant_registration"
                )

                sets = ", ".join(f"{k}=%s" for k in db_data.keys())
                values = list(db_data.values())

                cur.execute(
                    f"""
                    UPDATE {main_table}
                    SET {sets}, updated_at = NOW()
                    WHERE {role}_id = %s
                    """,
                    values + [entity_id]
                )

            # ✅ mark request approved
            cur.execute("""
                UPDATE profile_change_requests
                SET status='Approved', approved_at=NOW()
                WHERE id=%s
            """, (req_id,))

            conn.commit()

            # 📧 notify user
            email = get_entity_email(cur, role, entity_id)
            if email:
                send_mail(
                    to_email=email,
                    subject="Documents Approved",
                    html_body="<p>Your uploaded documents were approved.</p>"
                )

            return jsonify({"status": True})

        # 🔥 BRANCH / STORE SPECIAL HANDLING
        if section in ["branch", "store"]:

            target_table = req["target_table"]
            target_id = req["target_row_id"]

            if not target_table:
                return jsonify({"error": "Missing target_table"}), 400

            role_map = FIELD_MAP.get(role, {})
            section_map = role_map.get(section, {})

            db_data = {}

            # 🔑 REQUIRED FIELDS (ONLY FOR INSERT)
            if not target_id:
                if role == "supplier":
                    db_data["supplier_id"] = entity_id

                    # 🔥 REQUIRED: company_name (NOT NULL)
                    company_name = get_supplier_company_name(cur, entity_id)
                    if not company_name:
                        return jsonify({"error": "Company name not found"}), 400

                    db_data["company_name"] = company_name

                else:
                    db_data["restaurant_id"] = entity_id


            # 🔹 map editable fields
            for k, v in data.items():
                if k in section_map:
                    db_data[section_map[k]] = v

            if not db_data:
                # still approve (admin reviewed but no DB diff)
                cur.execute("""
                    UPDATE profile_change_requests
                    SET status='Approved', approved_at=NOW()
                    WHERE id=%s
                """, (req_id,))
                conn.commit()

                send_admin_notification(role, entity_id, f"{section.capitalize()} (No DB Change)")
                return jsonify({"status": True, "warning": "No DB fields updated"})


            # 🔹 UPDATE
            if target_id:
                ID_COLUMN = {
                    "supplier_branch_registration": "branch_id",
                    "restaurant_branch_registration": "branch_id",
                    "supplier_store_registration": "store_id",
                    "restaurant_store_registration": "store_id",
                }

                if target_table not in ID_COLUMN:
                    return jsonify({
                        "error": "Invalid target_table",
                        "target_table": target_table
                    }), 400

                id_col = ID_COLUMN[target_table]

                sets = ", ".join(f"{k}=%s" for k in db_data.keys())
                values = list(db_data.values())

                cur.execute(
                    f"""
                    UPDATE {target_table}
                    SET {sets}, updated_at = NOW()
                    WHERE {id_col} = %s
                    """,
                    values + [target_id]
                )

            # 🔹 INSERT
            else:
                cols = ", ".join(db_data.keys())
                placeholders = ", ".join(["%s"] * len(db_data))
                values = list(db_data.values())

                cur.execute(
                    f"""
                    INSERT INTO {target_table} ({cols})
                    VALUES ({placeholders})
                    """,
                    values
                )

            cur.execute("""
                UPDATE profile_change_requests
                SET status='Approved', approved_at=NOW()
                WHERE id=%s
            """, (req_id,))

            conn.commit()

            # 🔔 SEND MAIL HERE
            email = get_entity_email(cur, role, entity_id)
            if email:
                send_mail(
                    to_email=email,
                    subject="Profile Update Approved",
                    html_body=f"""
                    <h2>✅ {section.capitalize()} Approved</h2>
                    <p>Your {section} details have been approved.</p>
                    """
                )

            return jsonify({"status": True})

        main_table = "supplier_registration" if role == "supplier" else "restaurant_registration"

        if isinstance(data, str):
            data = json.loads(data)

        role_map = FIELD_MAP.get(role, {})
        section_map = role_map.get(section, {})

        db_data = {}
        for k, v in data.items():
            if k in section_map:
                db_data[section_map[k]] = v

        if not db_data:
            return jsonify({
                "error": "No valid fields",
                "received_keys": list(data.keys()),
                "expected_keys": list(section_map.keys())
            }), 400

        sets = ", ".join(f"{k}=%s" for k in db_data.keys())
        values = list(db_data.values())

        cur.execute(
            f"""
            UPDATE {main_table}
            SET {sets}, updated_at = NOW()
            WHERE {role}_id = %s
            """,
            values + [entity_id]
        )

        # ✅ Update request status
        cur.execute("""
            UPDATE profile_change_requests
            SET status='Approved', approved_at = NOW()
            WHERE id=%s
        """, (req_id,))

        conn.commit()   # ✅ COMMIT FIRST

        # 📧 SEND APPROVE MAIL (INSIDE ROUTE)
        email = get_entity_email(cur, role, entity_id)

        display_section = section.capitalize()

        if section == "basic":
            display_section = "Basic Profile"
        elif section == "branch":
            display_section = f"Branch (ID: {target_row_id})"
        elif section == "store":
            display_section = f"Store (ID: {target_row_id})"
        elif section == "files":
            display_section = "Documents"

        if email:
            html = f"""
            <h2>✅ Profile Change Approved</h2>
            <p>Your <b>{display_section}</b> update has been approved.</p>
            <p>You can login and continue.</p>
            <br/>
            <p>Mahal Team</p>
            """
            send_mail(
                to_email=email,
                subject="Profile Update Approved",
                html_body=html
            )

        send_admin_notification(role, entity_id, display_section)

        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ APPROVE ERROR:", e)
        return jsonify({"error": "internal error"}), 500

    finally:
        cur.close()
        conn.close()

@admin_changes_bp.route("/<int:req_id>/reject", methods=["POST"])
@require_admin()
def reject_change_request(req_id):

    # 🔥 SAME PERMISSION GATE
    if g.admin["role"] != "SUPER_ADMIN":
        return jsonify({
            "error": "Forbidden",
            "reason": "Only Super Admin can reject"
        }), 403

    reason = request.json.get("reason", "")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT role, entity_id, section
            FROM profile_change_requests
            WHERE id=%s
        """, (req_id,))
        req = cur.fetchone()

        role = req["role"]
        entity_id = req["entity_id"]
        section = req["section"]

        cur.execute("""
            UPDATE profile_change_requests
            SET status='Rejected',
                reason=%s,
                approved_at=NOW()
            WHERE id=%s
        """, (reason, req_id))

        conn.commit()   # ✅ COMMIT FIRST

        # 📧 SEND REJECT MAIL (INSIDE ROUTE)
        email = get_entity_email(cur, role, entity_id)
        if email:
            html = f"""
            <h2>❌ Profile Change Rejected</h2>
            <p>Your <b>{section}</b> update was rejected.</p>
            <p><b>Reason:</b> {reason}</p>
            <br/>
            <p>Mahal Team</p>
            """
            send_mail(
                to_email=email,
                subject="Profile Update Rejected",
                html_body=html
            )

        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ REJECT ERROR:", e)
        return jsonify({"error": "internal error"}), 500

    finally:
        cur.close()
        conn.close()