from flask import Blueprint, request, jsonify
from db import get_db_connection
from datetime import datetime
import traceback

branch_bp = Blueprint("branch_bp", __name__, url_prefix="/api")

# ===============================================================
# COMPANIES LIST
# ===============================================================
@branch_bp.route("/companies", methods=["GET"])
def get_companies():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ Fixed: company_name_english and company_name_arabic only
        cur.execute("""
            SELECT 
                supplier_id,
                COALESCE(company_name_english, company_name_arabic, 'Unnamed Company') AS company_name
            FROM supplier_registration
            ORDER BY supplier_id
        """)
        rows = cur.fetchall()
        companies = [{"supplier_id": r["supplier_id"], "company_name": r["company_name"]} for r in rows]

        cur.close()
        conn.close()
        return jsonify(companies), 200

    except Exception as e:
        print("❌ Error fetching companies:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ===============================================================
# GET BRANCHES
# ===============================================================
@branch_bp.route("/branches", methods=["GET"])
def get_branches():
    try:
        supplier_id = request.args.get("supplier_id", type=int)
        conn = get_db_connection()
        cur = conn.cursor()

        if supplier_id:
            cur.execute("""
                SELECT 
                    branch_id, supplier_id, company_name,
                    branch_name_english AS branch_name_en,
                    branch_name_arabic AS branch_name_ar,
                    branch_manager_name, contact_number, email, street, zone,
                    building, office_no, city, country, branch_license,
                    flag, created_at, updated_at
                FROM supplier_branch_registration
                WHERE supplier_id = %s
                ORDER BY branch_id
            """, (supplier_id,))
        else:
            cur.execute("""
                SELECT 
                    branch_id, supplier_id, company_name,
                    branch_name_english AS branch_name_en,
                    branch_name_arabic AS branch_name_ar,
                    branch_manager_name, contact_number, email, street, zone,
                    building, office_no, city, country, branch_license,
                    flag, created_at, updated_at
                FROM supplier_branch_registration
                ORDER BY branch_id
            """)

        rows = cur.fetchall()
        branches = [dict(r) for r in rows]

        cur.close()
        conn.close()
        return jsonify({"branches": branches}), 200
    except Exception as e:
        print("❌ Error fetching branches:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ===============================================================
# CREATE BRANCH
# ===============================================================
@branch_bp.route("/branches", methods=["POST"])
def create_branch():
    try:
        data = request.get_json() or {}
        required = ["supplier_id", "branch_name_en", "company_name"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO supplier_branch_registration
            (supplier_id, company_name, branch_name_english, branch_name_arabic,
             branch_manager_name, contact_number, email, street, zone, building,
             office_no, city, country, branch_license, flag, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'A',%s,%s)
            RETURNING branch_id
        """, (
            data.get("supplier_id"),
            data.get("company_name"),
            data.get("branch_name_en"),
            data.get("branch_name_ar"),
            data.get("branch_manager_name"),
            data.get("contact_number"),
            data.get("email"),
            data.get("street"),
            data.get("zone"),
            data.get("building"),
            data.get("office_no"),
            data.get("city"),
            data.get("country"),
            data.get("branch_license"),
            datetime.utcnow(),
            datetime.utcnow()
        ))
        branch_id = cur.fetchone()["branch_id"]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Branch created", "branch_id": branch_id}), 201
    except Exception as e:
        print("❌ Error creating branch:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ===============================================================
# UPDATE BRANCH
# ===============================================================
@branch_bp.route("/branches/<int:branch_id>", methods=["PUT"])
def update_branch(branch_id):
    try:
        data = request.get_json() or {}
        if not data:
            return jsonify({"error": "No data provided"}), 400

        mapping = {
            "company_name": "company_name",
            "branch_name_en": "branch_name_english",
            "branch_name_ar": "branch_name_arabic",
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

        set_clause = ", ".join([f"{mapping[k]}=%s" for k in data if k in mapping])
        values = [data[k] for k in data if k in mapping]
        values.extend([datetime.utcnow(), branch_id])

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(f"""
            UPDATE supplier_branch_registration
            SET {set_clause}, updated_at=%s
            WHERE branch_id=%s
        """, values)
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Branch updated successfully"}), 200
    except Exception as e:
        print("❌ Error updating branch:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


# ===============================================================
# DELETE BRANCH
# ===============================================================
@branch_bp.route("/branches/<int:branch_id>", methods=["DELETE"])
def delete_branch(branch_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM supplier_branch_registration WHERE branch_id=%s", (branch_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Branch deleted"}), 200
    except Exception as e:
        print("❌ Error deleting branch:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500