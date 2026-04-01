# backend/routes/filter_routes.py
from flask import Blueprint, jsonify, request
from db import get_db_connection

filter_bp = Blueprint("filter_bp", __name__)

@filter_bp.route("/filters", methods=["GET"])
def get_filters():
    conn = get_db_connection()
    cur = conn.cursor()

    # ✅ Example filters based on categories and prices
    cur.execute("SELECT DISTINCT category FROM products ORDER BY category;")
    categories = [row[0] for row in cur.fetchall()]

    cur.execute("SELECT MIN(price), MAX(price) FROM products;")
    price_range = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify({
        "categories": categories,
        "price_range": {
            "min": price_range[0],
            "max": price_range[1]
        }
    })
