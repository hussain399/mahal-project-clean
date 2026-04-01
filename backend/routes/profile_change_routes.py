# from flask import Blueprint, request, jsonify, g
# from db import get_db_connection
# import json
# from flask_cors import CORS
# from routes.notifications import send_admin_notification
# from routes.admin_guard import require_admin
# from routes.admin_audit import log_admin_action

# from datetime import date, datetime
# import re

# def serialize_dates(obj):
#     if isinstance(obj, (date, datetime)):
#         return obj.isoformat()
#     return obj

# import re

# def camel_to_snake(name):
#     s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
#     return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

# profile_change_bp = Blueprint("profile_change_bp", __name__, url_prefix="/api/profile")
# CORS(profile_change_bp)



# @profile_change_bp.route("/request-change-supplier", methods=["POST"])
# def request_change_supplier():
#     """
#     Supplier/Restaurant sends change request → Admin reviews later.
#     This MUST NOT call the admin endpoint.
#     """

#     from routes.profile_setup_routes import get_current_user

#     user = get_current_user()   # supplier/restaurant JWT

#     role = user.get("role")
#     if role not in ["supplier", "restaurant"]:
#         return jsonify({
#             "status": False,
#             "error": "Only supplier or restaurant can request changes"
#         }), 403

#     entity_id = (
#         user["supplier_id"] if role == "supplier"
#         else user["restaurant_id"]
#     )

#     data = request.get_json(silent=True) or {}

#     # FORCE server identity (prevents spoofing)
#     data["role"] = role
#     data["entity_id"] = entity_id

#     # 👉 CALL SHARED CORE INSTEAD OF ADMIN FUNCTION
#     return _request_change_core(data, admin_context=False)

# @profile_change_bp.route("/request-change-restaurant", methods=["POST"])
# def request_change_restaurant():
#     """
#     Mirror of supplier route, but explicit for restaurant
#     so your frontend URL works.
#     """

#     from routes.profile_setup_routes import get_current_user

#     user = get_current_user()

#     role = user.get("role")
#     if role != "restaurant":
#         return jsonify({
#             "status": False,
#             "error": "Only restaurant can use this route"
#         }), 403

#     entity_id = user["restaurant_id"]

#     data = request.get_json(silent=True) or {}

#     # FORCE identity
#     data["role"] = role
#     data["entity_id"] = entity_id

#     return _request_change_core(data, admin_context=False)



# def _request_change_core(data, admin_context=False):
#     """
#     Safe adapter — NEVER touch request.json here.
#     """

#     # If frontend wrapped payload as { data: {...} }, unwrap it
#     if isinstance(data, dict) and "data" in data:
#         data = data.get("data") or {}

#     if not isinstance(data, dict):
#         return jsonify({
#             "status": False,
#             "error": "Invalid request payload"
#         }), 400

#     response = request_change_logic(data)

#     if response is None:
#         return jsonify({
#             "status": False,
#             "error": "Server processing error"
#         }), 500

#     return response




# def request_change_logic(data):
#     """
#     REAL ENGINE for BOTH:
#     - Admin requests
#     - Supplier/Restaurant requests
#     """

#     role = data.get("role")
#     entity_id = data.get("entity_id")
#     section = data.get("section")
#     new_data = data.get("new_data")

#     # ---- VALIDATION ----
#     if not role or not entity_id or not section:
#         return jsonify({
#             "status": False,
#             "error": "Missing role / entity_id / section"
#         }), 400

#     ALLOWED_SECTIONS = [
#         "basic", "org", "address",
#         "bank", "files", "branch", "store"
#     ]

#     if section not in ALLOWED_SECTIONS:
#         return jsonify({
#             "status": False,
#             "error": f"Invalid section: {section}"
#         }), 400

#     if not isinstance(new_data, dict) or not new_data:
#         return jsonify({
#             "status": False,
#             "error": "Invalid or empty change request"
#         }), 400

#     # ---------- FROM HERE DOWN ----------
#     # COPY YOUR ENTIRE EXISTING DB LOGIC
#     # (target_table, SELECT old data, normalization,
#     # INSERT into profile_change_requests,
#     # send_admin_notification, etc.)
#     # EXACTLY AS YOU ALREADY WROTE.

#     # 👉 FROM HERE DOWN — YOUR EXISTING CODE CONTINUES UNCHANGED
#     # (target_table, DB queries, normalization, INSERT, email, etc.)

# @profile_change_bp.route("/request-change", methods=["POST"])
# @require_admin()
# def request_change():

#     # 🔐 PERMISSION GATE
#     if "VIEW_DASHBOARD" not in g.admin["permissions"]:
#         return jsonify({
#             "status": False,
#             "error": "Forbidden: insufficient permission"
#         }), 403

#     # 🔐 ROLE GATE (NEW — minimal & safe)
#     if g.admin["role"] not in ["SUPER_ADMIN", "OPERATIONS_ADMIN"]:
#         return jsonify({
#             "status": False,
#             "error": "Forbidden: only admin operations roles can request changes"
#         }), 403

#     data = request.get_json(silent=True) or {}

#     role = data.get("role")
#     entity_id = data.get("entity_id")
#     section = data.get("section")
#     new_data = data.get("new_data")

#     # 🔒 HARD VALIDATION FIRST
#     if not role or not entity_id or not section:
#         return jsonify({
#             "status": False,
#             "error": "Missing role / entity_id / section"
#         }), 400

#     ALLOWED_SECTIONS = [
#         "basic",
#         "org",
#         "address",
#         "bank",
#         "files",
#         "branch",
#         "store"
#     ]

#     if section not in ALLOWED_SECTIONS:
#         return jsonify({
#             "status": False,
#             "error": f"Invalid section: {section}"
#         }), 400

#     # ✅ ADD THESE TWO LINES
#     is_supplier = role == "supplier"
#     is_restaurant = role == "restaurant"

#     if not isinstance(new_data, dict):
#         return jsonify({
#             "status": False,
#             "error": "Invalid change request"
#         }), 400
    
#     if not new_data or not isinstance(new_data, dict):
#         return jsonify({
#             "status": False,
#             "error": "No changes detected"
#         }), 400
#     target_table = None
#     target_row_id = None

#     # ======== ONLY ENFORCE ID FOR BRANCH / STORE ========
#     if section in ["branch", "store"]:
#         target_row_id = (
#             data.get("branch_id")
#             or data.get("store_id")
#             or new_data.get("branch_id")
#             or new_data.get("store_id")
#         )

#         if not target_row_id:
#             return jsonify({
#                 "status": False,
#                 "error": f"Missing {section}_id for change request"
#             }), 400



#     if section == "branch":
#         target_table = (
#             "supplier_branch_registration"
#             if role == "supplier"
#             else "restaurant_branch_registration"
#         )
#         target_row_id = (
#             data.get("branch_id")
#             or new_data.get("branch_id")
#         )
#         if section == "branch" and not target_row_id:
#             return jsonify({
#                 "status": False,
#                 "error": "Missing branch_id for change request"
#             }), 400

#     elif section == "store":
#         target_table = (
#         "supplier_store_registration"
#         if role == "supplier"
#         else "restaurant_store_registration"
#     )
#     target_row_id = (
#         data.get("store_id")
#         or new_data.get("store_id")
#     )


#     conn = get_db_connection()
#     cur = conn.cursor()

#     old = {}

#     if section == "basic" and is_supplier:
#         cur.execute("""
#             SELECT
#                 company_name_english,
#                 contact_person_name,
#                 contact_person_email,
#                 contact_person_mobile,
#                 city,
#                 country
#             FROM supplier_registration
#             WHERE supplier_id = %s
#         """, (entity_id,))

#         row = cur.fetchone()
#         old = dict(row) if row else {}


#     elif section == "basic" and is_restaurant:
#         cur.execute("""
#             SELECT
#                 restaurant_name_english,
#                 contact_person_name,
#                 contact_person_email,
#                 contact_person_mobile,
#                 city,
#                 country
#             FROM restaurant_registration
#             WHERE restaurant_id = %s
#         """, (entity_id,))

#         row = cur.fetchone()
#         old = {
#             "company_name_english": row["restaurant_name_english"],
#             "contact_person_name": row["contact_person_name"],
#             "contact_person_email": row["contact_person_email"],
#             "contact_person_mobile": row["contact_person_mobile"],
#             "city": row["city"],
#             "country": row["country"],
#         } if row else {}

#     elif section == "org" and is_supplier:
#         cur.execute("""
#             SELECT
#                 cr_number,
#                 cr_expiry_date,
#                 computer_card_number,
#                 computer_card_expiry_date,
#                 signing_authority_name,
#                 sponsor_name,
#                 trade_license_name,
#                 vat_tax_number,
#                 category,
#                 brand_name,
#                 company_email
#             FROM supplier_registration
#             WHERE supplier_id = %s
#         """, (entity_id,))

#         row = cur.fetchone()
#         old = dict(row) if row else {}

#     elif section == "org" and is_restaurant:
#         cur.execute("""
#             SELECT
#                 restaurant_name_english,
#                 restaurant_email_address,
#                 contact_person_name,
#                 contact_person_mobile,
#                 contact_person_email,
#                 cr_number,
#                 cr_expiry_date,
#                 computer_card_number,
#                 computer_card_expiry_date,
#                 signing_authority_name,
#                 sponsor_name,
#                 trade_license_name,
#                 vat_tax_number
#             FROM restaurant_registration
#             WHERE restaurant_id = %s
#         """, (entity_id,))

#         old = dict(cur.fetchone() or {})

#     elif section == "bank" and is_supplier:
#         cur.execute("""
#             SELECT
#                 bank_name,
#                 iban,
#                 account_holder_name,
#                 bank_branch,
#                 swift_code
#             FROM supplier_registration
#             WHERE supplier_id = %s
#         """, (entity_id,))

#         row = cur.fetchone()
#         old = dict(row) if row else {}

#     elif section == "bank" and is_restaurant:
#         cur.execute("""
#             SELECT
#                 bank_name,
#                 iban,
#                 account_holder_name,
#                 bank_branch,
#                 swift_code
#             FROM restaurant_registration
#             WHERE restaurant_id = %s
#         """, (entity_id,))

#         old = dict(cur.fetchone() or {})

#     elif section == "address" and is_supplier:
#         cur.execute("""
#             SELECT
#                 address,
#                 street,
#                 zone,
#                 area,
#                 city,
#                 country
#             FROM supplier_registration
#             WHERE supplier_id = %s
#         """, (entity_id,))

#         row = cur.fetchone()
#         old = dict(row) if row else {}

#     elif section == "address" and is_restaurant:
#         cur.execute("""
#             SELECT
#                 address,
#                 street,
#                 zone,
#                 area,
#                 city,
#                 country
#             FROM restaurant_registration
#             WHERE restaurant_id = %s
#         """, (entity_id,))

#         old = dict(cur.fetchone() or {})

#     elif section == "files":
#         if role == "supplier":
#             cur.execute("""
#                 SELECT
#                     upload_cr_company,
#                     upload_computer_card_copy,
#                     upload_trade_license_copy,
#                     upload_vat_certificates_copy,
#                     upload_company_logo,
#                     upload_bank_letter,
#                     certificates
#                 FROM supplier_registration
#                 WHERE supplier_id = %s
#             """, (entity_id,))
#         else:
#             cur.execute("""
#                 SELECT
#                     upload_cr_copy,
#                     upload_computer_card_copy,
#                     upload_trade_license_copy,
#                     upload_vat_certificate_copy,
#                     upload_food_safety_certificate,
#                     upload_company_logo
#                 FROM restaurant_registration
#                 WHERE restaurant_id = %s
#             """, (entity_id,))

#         row = cur.fetchone()
#         old = dict(row) if row else {}

#     elif section == "branch" and is_supplier and target_row_id:
#         cur.execute("""
#             SELECT
#                 branch_name_english,
#                 branch_name_arabic,
#                 branch_manager_name,
#                 contact_number,
#                 email,
#                 street,
#                 zone,
#                 building,
#                 office_no,
#                 city,
#                 country,
#                 branch_license
#             FROM supplier_branch_registration
#             WHERE branch_id = %s
#         """, (target_row_id,))

#         row = cur.fetchone()
#         old = {
#             "branch_name_english": row["branch_name_english"],
#             "branch_name_arabic": row["branch_name_arabic"],
#             "branch_manager_name": row["branch_manager_name"],
#             "contact_number": row["contact_number"],
#             "email": row["email"],
#             "street": row["street"],
#             "zone": row["zone"],
#             "building": row["building"],
#             "office_no": row["office_no"],
#             "city": row["city"],
#             "country": row["country"],
#             "branch_license": row["branch_license"],
#         } if row else {}

#     elif section == "branch" and is_restaurant and target_row_id:
#         cur.execute("""
#             SELECT
#                 branch_name_english,
#                 branch_name_arabic,
#                 branch_manager_name,
#                 contact_number,
#                 email,
#                 street,
#                 zone,
#                 building,
#                 office_number,
#                 city,
#                 country
#             FROM restaurant_branch_registration
#             WHERE branch_id = %s
#         """, (target_row_id,))

#         row = cur.fetchone()
#         old = {
#             "branch_name_english": row["branch_name_english"],
#             "branch_name_arabic": row["branch_name_arabic"],
#             "branch_manager_name": row["branch_manager_name"],
#             "contact_number": row["contact_number"],
#             "email": row["email"],
#             "street": row["street"],
#             "zone": row["zone"],
#             "building": row["building"],
#             "office_number": row["office_number"],
#             "city": row["city"],
#             "country": row["country"],
#         } if row else {}

#     elif section == "store" and is_supplier and target_row_id:
#         cur.execute("""
#             SELECT
#                 store_name_english,
#                 store_name_arabic, 
#                 contact_person_name,
#                 contact_person_mobile,
#                 email,
#                 street,
#                 zone,
#                 building,
#                 shop_no,
#                 operating_hours,
#                 city,
#                 country,
#                 store_type,
#                 delivery_pickup_availability
#             FROM supplier_store_registration
#             WHERE store_id = %s
#         """, (target_row_id,))

#         row = cur.fetchone()
#         old = {
#             "store_name_english": row["store_name_english"],
#             "store_name_arabic": row["store_name_arabic"],
#             "contact_person_name": row["contact_person_name"],
#             "contact_person_mobile": row["contact_person_mobile"],
#             "email": row["email"],
#             "street": row["street"],
#             "zone": row["zone"],
#             "building": row["building"],
#             "shop_no": row["shop_no"],
#             "operating_hours": row["operating_hours"],
#             "store_type": row["store_type"],
#             "delivery_pickup_availability": row["delivery_pickup_availability"],
#             "city": row["city"],
#             "country": row["country"],
#         } if row else {}
    
#     elif section == "store" and is_restaurant and target_row_id:
#         cur.execute("""
#             SELECT
#                 store_name_english,
#                 store_name_arabic,
#                 contact_person_name,
#                 contact_person_mobile,
#                 email,
#                 street,
#                 zone,
#                 building,
#                 shop_no,
#                 operating_hours,
#                 city,
#                 country
#             FROM restaurant_store_registration
#             WHERE store_id = %s
#         """, (target_row_id,))

#         row = cur.fetchone()
#         old = {
#             "store_name_english": row["store_name_english"],
#             "store_name_arabic": row["store_name_arabic"],
#             "contact_person_name": row["contact_person_name"],
#             "contact_person_mobile": row["contact_person_mobile"],
#             "email": row["email"],
#             "street": row["street"],
#             "zone": row["zone"],
#             "building": row["building"],
#             "shop_no": row["shop_no"],
#             "operating_hours": row["operating_hours"],
#             "city": row["city"],
#             "country": row["country"],
#         } if row else {}

#     old_data = { k: serialize_dates(v) for k, v in old.items()} if old else {}

#     normalized_new_data = {}

#     for k, v in new_data.items():
#         key = camel_to_snake(k)

#         # 🔥 FIX: VAT KEY NORMALIZATION (SUPPLIER)
#         if role == "supplier" and key == "upload_vat_certificates_copy":
#             key = "upload_vat_certificate_copy"

#         # 🔥 FIX: OFFICE NO FOR RESTAURANT
#         if key == "office_no" and role == "restaurant":
#             key = "office_number"

#         normalized_new_data[key] = v

#     print("===== DEBUG REQUEST CHANGE =====")
#     print("SECTION:", section)
#     print("ROLE:", role)
#     print("OLD RAW:", old)
#     print("OLD FINAL:", old_data)
#     print("NEW RAW:", new_data)
#     print("NEW NORMALIZED:", normalized_new_data)
#     print("TARGET ROW ID:", target_row_id)
#     print("================================")

#         # ✅ SAFETY CHECK MUST HAPPEN *BEFORE* INSERT — NOT AFTER
#     if not target_table:
#         return jsonify({
#             "status": False,
#             "error": f"No target table resolved for section: {section}"
#         }), 500

#     cur.execute("""
#     INSERT INTO profile_change_requests
#     (role, entity_id, section, old_data, new_data, target_table, target_row_id)
#     VALUES (%s, %s, %s, %s, %s, %s, %s)
#     """, (
#         role,
#         entity_id,
#         section,
#         json.dumps(old_data),
#         json.dumps(normalized_new_data),
#         target_table,
#         target_row_id,
#     ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     print("REQ CHANGE:", {
#         "role": role,
#         "entity_id": entity_id,
#         "section": section,
#         "target_row_id": target_row_id,
#         "new_data": new_data
#     })

#     # 🔔 Email should NEVER break API
#     try:
#         send_admin_notification(
#             role=role,
#             entity_id=entity_id,
#             section=section,
#             target_row_id=target_row_id
#         )
#     except Exception as e:
#         print("⚠️ Admin email failed:", e)

#     return jsonify({
#         "status": True,
#         "message": "Change request submitted and Admin notified"
#     })

from flask import Blueprint, request, jsonify, g
from db import get_db_connection
import json
from flask_cors import CORS
from routes.notifications import send_admin_notification
from routes.admin_guard import require_admin

from datetime import date, datetime
import re

# ======================================================
# UTILITIES
# ======================================================

def serialize_dates(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    return obj

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

# ======================================================
# BLUEPRINT
# ======================================================

profile_change_bp = Blueprint(
    "profile_change_bp",
    __name__,
    url_prefix="/api/profile"
)
CORS(profile_change_bp)

# ======================================================
# SUPPLIER REQUEST
# ======================================================

@profile_change_bp.route("/request-change-supplier", methods=["POST"])
def request_change_supplier():
    from routes.profile_setup_routes import get_current_user

    user = get_current_user()

    role = user.get("role")
    if role not in ["supplier", "restaurant"]:
        return jsonify({
            "status": False,
            "error": "Only supplier or restaurant can request changes"
        }), 403

    entity_id = (
        user["supplier_id"] if role == "supplier"
        else user["restaurant_id"]
    )

    data = request.get_json(silent=True) or {}

    # Force server identity (prevents spoofing)
    data["role"] = role
    data["entity_id"] = entity_id

    return _request_change_core(data)

# ======================================================
# RESTAURANT REQUEST
# ======================================================

@profile_change_bp.route("/request-change-restaurant", methods=["POST"])
def request_change_restaurant():
    from routes.profile_setup_routes import get_current_user

    user = get_current_user()

    if user.get("role") != "restaurant":
        return jsonify({
            "status": False,
            "error": "Only restaurant can use this route"
        }), 403

    data = request.get_json(silent=True) or {}
    data["role"] = "restaurant"
    data["entity_id"] = user["restaurant_id"]

    return _request_change_core(data)

# ======================================================
# SHARED CORE ADAPTER
# ======================================================

def _request_change_core(data):
    if isinstance(data, dict) and "data" in data:
        data = data.get("data") or {}

    if not isinstance(data, dict):
        return jsonify({
            "status": False,
            "error": "Invalid request payload"
        }), 400

    response = request_change_logic(data)

    if response is None:
        return jsonify({
            "status": False,
            "error": "Server processing error"
        }), 500

    return response

# ======================================================
# ADMIN REQUEST (WRAPPER ONLY — NO DB LOGIC HERE)
# ======================================================

@profile_change_bp.route("/request-change", methods=["POST"])
@require_admin()
def request_change_admin():

    if "VIEW_DASHBOARD" not in g.admin["permissions"]:
        return jsonify({
            "status": False,
            "error": "Forbidden: insufficient permission"
        }), 403

    if g.admin["role"] not in ["SUPER_ADMIN", "OPERATIONS_ADMIN"]:
        return jsonify({
            "status": False,
            "error": "Forbidden: only operations roles can request changes"
        }), 403

    data = request.get_json(silent=True) or {}

    if not data.get("role") or not data.get("entity_id") or not data.get("section"):
        return jsonify({
            "status": False,
            "error": "Missing role / entity_id / section"
        }), 400

    return request_change_logic(data)

# ======================================================
# SINGLE ENGINE (THE HEART OF THE SYSTEM)
# ======================================================

def request_change_logic(data):
    role = data.get("role")
    entity_id = data.get("entity_id")
    section = data.get("section")
    new_data = data.get("new_data")

    # -------- VALIDATION --------
    if not role or not entity_id or not section:
        return jsonify({
            "status": False,
            "error": "Missing role / entity_id / section"
        }), 400

    ALLOWED_SECTIONS = [
        "basic", "org", "address",
        "bank", "files", "branch", "store"
    ]

    if section not in ALLOWED_SECTIONS:
        return jsonify({
            "status": False,
            "error": f"Invalid section: {section}"
        }), 400

    if not isinstance(new_data, dict) or not new_data:
        return jsonify({
            "status": False,
            "error": "Invalid or empty change request"
        }), 400

    is_supplier = role == "supplier"
    is_restaurant = role == "restaurant"

    # -------- RESOLVE TARGET TABLE --------
    target_table = None
    target_row_id = None

    if section in ["basic", "org", "address", "bank", "files"]:
        target_table = (
            "supplier_registration"
            if is_supplier else
            "restaurant_registration"
        )

    elif section == "branch":
        target_table = (
            "supplier_branch_registration"
            if is_supplier else
            "restaurant_branch_registration"
        )
        target_row_id = data.get("branch_id") or new_data.get("branch_id")
        if not target_row_id:
            return jsonify({
                "status": False,
                "error": "Missing branch_id for change request"
            }), 400

    elif section == "store":
        target_table = (
            "supplier_store_registration"
            if is_supplier else
            "restaurant_store_registration"
        )
        target_row_id = data.get("store_id") or new_data.get("store_id")
        if not target_row_id:
            return jsonify({
                "status": False,
                "error": "Missing store_id for change request"
            }), 400

    # -------- FETCH OLD DATA --------
    conn = get_db_connection()
    cur = conn.cursor()

    old = {}

    if section == "basic" and is_supplier:
        cur.execute("""
            SELECT company_name_english,
                   contact_person_name,
                   contact_person_email,
                   contact_person_mobile,
                   city, country
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (entity_id,))
        row = cur.fetchone()
        old = dict(row) if row else {}

    elif section == "basic" and is_restaurant:
        cur.execute("""
            SELECT restaurant_name_english,
                   contact_person_name,
                   contact_person_email,
                   contact_person_mobile,
                   city, country
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (entity_id,))
        row = cur.fetchone()
        old = {
            "company_name_english": row["restaurant_name_english"],
            "contact_person_name": row["contact_person_name"],
            "contact_person_email": row["contact_person_email"],
            "contact_person_mobile": row["contact_person_mobile"],
            "city": row["city"],
            "country": row["country"],
        } if row else {}

    elif section == "org" and is_supplier:
        cur.execute("""
            SELECT cr_number, cr_expiry_date,
                   computer_card_number, computer_card_expiry_date,
                   signing_authority_name, sponsor_name,
                   trade_license_name, vat_tax_number,
                   category, brand_name, company_email
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (entity_id,))
        row = cur.fetchone()
        old = dict(row) if row else {}

    elif section == "org" and is_restaurant:
        cur.execute("""
            SELECT restaurant_name_english,
                   restaurant_email_address,
                   contact_person_name,
                   contact_person_mobile,
                   contact_person_email,
                   cr_number, cr_expiry_date,
                   computer_card_number, computer_card_expiry_date,
                   signing_authority_name, sponsor_name,
                   trade_license_name, vat_tax_number
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (entity_id,))
        old = dict(cur.fetchone() or {})

    elif section == "bank":
        table = (
            "supplier_registration"
            if is_supplier else
            "restaurant_registration"
        )
        cur.execute(f"""
            SELECT bank_name, iban,
                   account_holder_name,
                   bank_branch, swift_code
            FROM {table}
            WHERE {'supplier_id' if is_supplier else 'restaurant_id'} = %s
        """, (entity_id,))
        old = dict(cur.fetchone() or {})

    elif section == "address":
        table = (
            "supplier_registration"
            if is_supplier else
            "restaurant_registration"
        )
        cur.execute(f"""
            SELECT address, street, zone, area, city, country
            FROM {table}
            WHERE {'supplier_id' if is_supplier else 'restaurant_id'} = %s
        """, (entity_id,))
        old = dict(cur.fetchone() or {})

    elif section == "files":
        if is_supplier:
            cur.execute("""
                SELECT upload_cr_company,
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
                SELECT upload_cr_copy,
                       upload_computer_card_copy,
                       upload_trade_license_copy,
                       upload_vat_certificate_copy,
                       upload_food_safety_certificate,
                       upload_company_logo
                FROM restaurant_registration
                WHERE restaurant_id = %s
            """, (entity_id,))
        old = dict(cur.fetchone() or {})

    # -------- NORMALIZE NEW DATA --------
    old_data = {k: serialize_dates(v) for k, v in old.items()} if old else {}
    normalized_new_data = {}

    for k, v in new_data.items():
        key = camel_to_snake(k)

        if is_supplier and key == "upload_vat_certificates_copy":
            key = "upload_vat_certificate_copy"

        if key == "office_no" and is_restaurant:
            key = "office_number"

        normalized_new_data[key] = v

    # -------- FINAL SAFETY CHECK --------
    if not target_table:
        return jsonify({
            "status": False,
            "error": f"No target table resolved for section: {section}"
        }), 500

    # -------- INSERT CHANGE REQUEST --------
    cur.execute("""
        INSERT INTO profile_change_requests
        (role, entity_id, section, old_data, new_data, target_table, target_row_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        role,
        entity_id,
        section,
        json.dumps(old_data),
        json.dumps(normalized_new_data),
        target_table,
        target_row_id,
    ))

    conn.commit()
    cur.close()
    conn.close()

    # -------- NOTIFY ADMIN (NON-BLOCKING) --------
    try:
        send_admin_notification(
            role=role,
            entity_id=entity_id,
            section=section,
            target_row_id=target_row_id
        )
    except Exception as e:
        print("⚠️ Admin email failed:", e)

    return jsonify({
        "status": True,
        "message": "Change request submitted and Admin notified"
    })