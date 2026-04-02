from flask import Blueprint, jsonify
from backend.db import get_db_connection
import psycopg2.extras

addresses_bp = Blueprint("addresses_bp", __name__)

@addresses_bp.route("/addresses", methods=["GET"])
def get_addresses():
    """
    Fetch dropdown values from general_master grouped by category.
    Now includes 'category' for supplier registration form.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # ADD category here ✔️
        fields = ["address", "street", "zone", "country", "area", "category"]
        data = {}

        for field in fields:
            cur.execute("""
                SELECT value
                FROM general_master
                WHERE category = %s
                ORDER BY value ASC
            """, (field,))

            rows = cur.fetchall()

            data[field] = [
                row["value"] for row in rows
                if row.get("value")
            ]

        cur.close()
        conn.close()

        return jsonify(data), 200

    except Exception as e:
        print("❌ Unexpected error in get_addresses:", repr(e))
        return jsonify({"error": "Server error"}), 500