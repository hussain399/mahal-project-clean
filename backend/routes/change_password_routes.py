# routes/change_password_routes.py
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from backend.db import get_db_connection

change_bp = Blueprint("change_bp", __name__)

@change_bp.route("/change-password", methods=["POST"])
def change_password():
    data = request.get_json()
    username = data.get("username")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not username or not old_password or not new_password:
        return jsonify({"message": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT user_id, username, password, is_first_login
            FROM users 
            WHERE username = %s
        """, (username,))

        user = cur.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        if str(user["password"]).strip() != str(old_password).strip():
            return jsonify({"message": "Old password is incorrect"}), 401

        # Update password
        cur.execute("""
            UPDATE users
            SET password = %s, is_first_login = FALSE
            WHERE user_id = %s
        """, (new_password, user["user_id"]))

        conn.commit()
        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        print("❌ Change password error:", e)
        return jsonify({"message": "Server error"}), 500

    finally:
        cur.close()
        conn.close()