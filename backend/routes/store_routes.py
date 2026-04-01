# stores_routes.py
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from datetime import datetime

store_bp = Blueprint("store_bp", __name__, url_prefix="/api")
CORS(store_bp, origins=["http://localhost:3000"])  # Allow frontend React app


# ===============================================================
# GET all stores (optionally filter by supplier_id)
# ===============================================================
@store_bp.route("/stores", methods=["GET"])
def get_stores():
    try:
        supplier_id = request.args.get("supplier_id", type=int)
        conn = get_db_connection()
        cur = conn.cursor()

        if supplier_id:
            cur.execute("""
                SELECT *
                FROM supplier_store_registration
                WHERE supplier_id = %s
                ORDER BY store_id ASC
            """, (supplier_id,))
        else:
            cur.execute("""
                SELECT *
                FROM supplier_store_registration
                ORDER BY created_at DESC
            """)

        rows = cur.fetchall()
        stores = [dict(r) for r in rows]

        cur.close()
        conn.close()
        return jsonify({"stores": stores}), 200

    except Exception as e:
        print("❌ Error fetching stores:", e)
        return jsonify({"error": "server error"}), 500


# ===============================================================
# CREATE STORE (fixed ✅)
# ===============================================================
@store_bp.route("/stores", methods=["POST"])
def create_store():
    try:
        data = request.get_json() or {}
        required_fields = ["supplier_id", "store_name_en", "branch_id", "company_name"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 422

        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ Fetch branch name based on branch_id
        branch_name = None
        if data.get("branch_id"):
            cur.execute("""
                SELECT branch_name_english
                FROM supplier_branch_registration
                WHERE branch_id=%s
            """, (data["branch_id"],))
            result = cur.fetchone()
            if result:
                branch_name = result["branch_name_english"]

        # ✅ Fetch supplier_name from supplier_registration
        supplier_name = None
        cur.execute("""
            SELECT COALESCE(company_name_english, company_name_arabic, 'Unnamed Supplier') AS supplier_name
            FROM supplier_registration
            WHERE supplier_id=%s
        """, (data["supplier_id"],))
        result = cur.fetchone()
        if result:
            supplier_name = result["supplier_name"]

        # ✅ Insert new store record
        cur.execute("""
            INSERT INTO supplier_store_registration
            (supplier_id, supplier_name, company_name, branch_name,
             store_name_english, store_name_arabic,
             contact_person_name, contact_person_mobile,
             email, street, zone, city, country, building, shop_no,
             operating_hours, store_type, delivery_pickup_availability,
             created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING store_id
        """, (
            data.get("supplier_id"),
            supplier_name,                     # ✅ added field
            data.get("company_name"),
            branch_name,
            data.get("store_name_en"),
            data.get("store_name_ar"),
            data.get("contact_person_name"),
            data.get("contact_person_mobile"),
            data.get("email"),
            data.get("street"),
            data.get("zone"),
            data.get("city"),
            data.get("country"),
            data.get("building"),
            data.get("shop_no"),
            data.get("operating_hours"),
            data.get("store_type"),
            data.get("delivery_pickup_availability"),
            datetime.utcnow(),
            datetime.utcnow()
        ))

        store_id = cur.fetchone()["store_id"]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "message": "Store created successfully",
            "store_id": store_id,
            "branch_name": branch_name,
            "supplier_name": supplier_name
        }), 201

    except Exception as e:
        print("❌ Error creating store:", e)
        return jsonify({"error": str(e)}), 500


# ===============================================================
# UPDATE store
# ===============================================================
@store_bp.route("/stores/<int:store_id>", methods=["PUT"])
def update_store(store_id):
    try:
        data = request.get_json() or {}
        if not data:
            return jsonify({"error": "No data provided"}), 400

        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ Fix field name mapping (React → DB)
        field_map = {
            "store_name_en": "store_name_english",
            "store_name_ar": "store_name_arabic",
        }

        for old, new in field_map.items():
            if old in data:
                data[new] = data.pop(old)

        # ✅ Handle branch_id manually
        branch_name = data.get("branch_name")
        if data.get("branch_id"):
            cur.execute("""
                SELECT branch_name_english
                FROM supplier_branch_registration
                WHERE branch_id=%s
            """, (data["branch_id"],))
            result = cur.fetchone()
            if result:
                branch_name = result["branch_name_english"]

        if "branch_id" in data:
            data.pop("branch_id")

        data["branch_name"] = branch_name

        # ✅ Build SQL dynamically
        fields = ", ".join([f"{k}=%s" for k in data.keys()])
        values = list(data.values())
        values.extend([datetime.utcnow(), store_id])  # updated_at + store_id

        cur.execute(f"""
            UPDATE supplier_store_registration
            SET {fields}, updated_at=%s
            WHERE store_id=%s
        """, values)

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Store updated successfully"}), 200

    except Exception as e:
        print("❌ Error updating store:", e)
        return jsonify({"error": str(e)}), 500


# ===============================================================
# DELETE store
# ===============================================================
@store_bp.route("/stores/<int:store_id>", methods=["DELETE"])
def delete_store(store_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM supplier_store_registration WHERE store_id=%s", (store_id,))
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"message": "Store deleted successfully"}), 200

    except Exception as e:
        print("❌ Error deleting store:", e)
        return jsonify({"error": "server error"}), 500


# ===============================================================
# GET all suppliers (for company dropdown)
# ===============================================================
@store_bp.route("/companies", methods=["GET"])
def get_companies():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT supplier_id,
                   COALESCE(company_name_english, company_name_arabic, 'Unnamed') AS company_name
            FROM supplier_registration
            ORDER BY supplier_id
        """)
        rows = cur.fetchall()
        companies = [dict(r) for r in rows]
        cur.close()
        conn.close()
        return jsonify(companies), 200

    except Exception as e:
        print("❌ Error fetching companies:", e)
        return jsonify({"error": "server error"}), 500


# ===============================================================
# GET branches for a supplier (for branch dropdown)
# ===============================================================
@store_bp.route("/branches", methods=["GET"])
def get_branches():
    try:
        supplier_id = request.args.get("supplier_id", type=int)
        conn = get_db_connection()
        cur = conn.cursor()

        if supplier_id:
            cur.execute("""
                SELECT branch_id, branch_name_english AS branch_name
                FROM supplier_branch_registration
                WHERE supplier_id=%s
                ORDER BY branch_id
            """, (supplier_id,))
        else:
            cur.execute("""
                SELECT branch_id, branch_name_english AS branch_name
                FROM supplier_branch_registration
                ORDER BY branch_id
            """)

        rows = cur.fetchall()
        branches = [dict(r) for r in rows]
        cur.close()
        conn.close()

        return jsonify(branches), 200

    except Exception as e:
        print("❌ Error fetching branches:", e)
        return jsonify({"error": "server error"}), 500
    
from flask import Blueprint, request, jsonify
from db import get_db_connection

stores_bp = Blueprint("stores_bp", __name__)

@stores_bp.route("/v1/stores", methods=["GET"])
def get_stores():
    supplier_id = request.args.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT store_id, store_name_english
            FROM restaurant_store_registration
            WHERE supplier_id = %s
            ORDER BY store_name_english
        """, (supplier_id,))

        rows = cur.fetchall()
        result = [{"store_id": r[0], "store_name": r[1]} for r in rows]

        cur.close()
        conn.close()

        return jsonify(result), 200

    except Exception as e:
        print("❌ Error in get_stores:", e)
        return jsonify({"error": "Server error"}), 500