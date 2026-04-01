from flask import Blueprint, jsonify, request
from db import get_db_connection
import psycopg2.extras

recipe_bp = Blueprint("recipe_bp", __name__, url_prefix="/api/recipes")


# =====================================================
# GET MENU ITEMS (RESTAURANT-WISE)
# =====================================================
@recipe_bp.route("/menu-items", methods=["GET"])
def get_menu_items():
    restaurant_id = request.args.get("restaurant_id")

    if not restaurant_id:
        return jsonify({"error": "restaurant_id required"}), 400

    try:
        restaurant_id = int(restaurant_id)
    except ValueError:
        return jsonify({"error": "Invalid restaurant_id"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            id,
            name,
            encode(image, 'base64')::text AS image
        FROM menu_items
        WHERE restaurant_id = %s
          AND status = true
        ORDER BY name
    """, (restaurant_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# =====================================================
# GET UNITS
# =====================================================
@recipe_bp.route("/units", methods=["GET"])
def get_units():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            value AS label,
            unit AS value
        FROM general_master
        WHERE category = 'UNIT'
        ORDER BY value
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# =====================================================
# SAVE RECIPE (FULLY SAFE)
# =====================================================
@recipe_bp.route("/save", methods=["POST"])
def save_recipe():
    data = request.json

    restaurant_id = data.get("restaurant_id")
    menu_id = data.get("menu_id")
    ingredients = data.get("ingredients", [])

    if not restaurant_id or not menu_id:
        return jsonify({"error": "restaurant and menu required"}), 400

    if not ingredients:
        return jsonify({"error": "Ingredients required"}), 400

    try:
        restaurant_id = int(restaurant_id)
        menu_id = int(menu_id)
    except ValueError:
        return jsonify({"error": "Invalid IDs"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 🔐 Validate menu belongs to restaurant
    cur.execute("""
        SELECT 1
        FROM menu_items
        WHERE id = %s AND restaurant_id = %s
    """, (menu_id, restaurant_id))

    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized menu item"}), 403

    # 🧹 Delete existing recipe (edit-safe)
    cur.execute("""
        DELETE FROM recipes
        WHERE menu_item_id = %s
    """, (menu_id,))

    # ➕ Create recipe
    cur.execute("""
        INSERT INTO recipes (menu_item_id)
        VALUES (%s)
        RETURNING id
    """, (menu_id,))

    recipe_id = cur.fetchone()[0]

    saved = 0
    for item in ingredients:
        name = item.get("name", "").strip()
        qty = item.get("quantity", "").strip()
        unit = item.get("unit", "").strip()

        if not name or not qty or not unit:
            continue

        try:
            qty = float(qty)
        except ValueError:
            continue

        cur.execute("""
            INSERT INTO recipe_ingredients
            (recipe_id, ingredient, quantity, unit)
            VALUES (%s, %s, %s, %s)
        """, (recipe_id, name, qty, unit))

        saved += 1

    if saved == 0:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "No valid ingredients"}), 400

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": f"Recipe saved with {saved} ingredients"
    }), 201
