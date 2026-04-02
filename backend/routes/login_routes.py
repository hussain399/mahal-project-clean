from flask import Blueprint, request, jsonify
from backend.db import get_db_connection

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username", "").strip().lower()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Match username ignoring case
        cur.execute("""
            SELECT supplier_id, login_username, login_password, is_first_login
            FROM supplier_registration
            WHERE LOWER(login_username) = %s
        """, (username,))

        supplier = cur.fetchone()

        if not supplier:
            print("❌ Invalid username:", username)
            return jsonify({"message": "Invalid username"}), 401

        # Access as dictionary (RealDictRow)
        db_supplier_id = supplier['supplier_id']
        db_username = supplier['login_username']
        db_password = supplier['login_password']
        is_first_login = supplier['is_first_login']

        print(f"✅ DB found username={db_username}, password={db_password}, first_login={is_first_login}")

        # Compare passwords safely
        if str(db_password).strip() != password:
            print("❌ Invalid password for user:", username)
            return jsonify({"message": "Invalid password"}), 401

        if is_first_login:
            print("🔑 First login for user:", username)
            return jsonify({
                "message": "First login — please change your password",
                "temp": True,
                "supplier_id": db_supplier_id
            }), 200

        print("✅ Login success for:", username)
        return jsonify({
            "message": "Login successful",
            "temp": False,
            "supplier_id": db_supplier_id
        }), 200

    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({"message": "Server error"}), 500
    finally:
        cur.close()
        conn.close()
