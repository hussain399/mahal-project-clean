from flask import Blueprint, request, jsonify
from backend.db import get_db_connection
from psycopg2.extras import RealDictCursor

search_bp = Blueprint("search_bp", __name__)


# =========================================================
# AUTOCOMPLETE SEARCH
# =========================================================
@search_bp.route("/products/search", methods=["GET"])
def autocomplete_search():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        q = request.args.get("q", "").strip()

        if not q:
            return jsonify([])

        cur.execute(
            """
            SELECT
                product_id AS id,
                product_name_english AS name,
                COALESCE(similarity(product_name_english, %s), 0) AS score
            FROM search_index
            WHERE
                product_name_english ILIKE %s
                OR similarity(product_name_english, %s) > 0.2
            ORDER BY score DESC, relevance_score DESC
            LIMIT 8
            """,
            (q, f"%{q}%", q),
        )

        return jsonify(cur.fetchall())

    except Exception as e:
        print("Autocomplete error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()


# =========================================================
# FULL SEARCH
# =========================================================
@search_bp.route("/products/full-search", methods=["GET"])
def full_search():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        q = request.args.get("q", "").strip()
        category = request.args.get("category")

        if not q:
            return jsonify({"products": []})

        sql = """
        SELECT *,
               COALESCE(similarity(product_name_english, %s),0) AS score
        FROM search_index
        WHERE (
            similarity(product_name_english, %s) > 0.2
            OR product_name_english ILIKE %s
            OR product_description ILIKE %s
        )
        """

        params = [q, q, f"%{q}%", f"%{q}%"]

        if category and category != "All":
            sql += " AND product_category = %s"
            params.append(category)

        sql += " ORDER BY score DESC, relevance_score DESC LIMIT 50"

        cur.execute(sql, params)

        return jsonify({"products": cur.fetchall()})

    except Exception as e:
        print("Full search error:", e)
        return jsonify({"products": []})

    finally:
        cur.close()
        conn.close()


# =========================================================
# LOG SEARCH
# =========================================================
@search_bp.route("/search/log", methods=["POST"])
def log_search():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        data = request.json
        text = data.get("search_text")

        if text:
            cur.execute(
                "INSERT INTO search_log (search_text) VALUES (%s)",
                (text,),
            )
            conn.commit()

        return jsonify({"ok": True})

    except Exception as e:
        print("Log search error:", e)
        return jsonify({"ok": True})

    finally:
        cur.close()
        conn.close()


# =========================================================
# RECENT SEARCHES
# =========================================================
@search_bp.route("/search/recent", methods=["GET"])
def recent_searches():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            """
            SELECT search_text
            FROM search_log
            ORDER BY searched_at DESC
            LIMIT 6
            """
        )
        return jsonify(cur.fetchall())

    except Exception as e:
        print("Recent search error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()


# =========================================================
# TRENDING SEARCHES
# =========================================================
@search_bp.route("/search/trending", methods=["GET"])
def trending_searches():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            """
            SELECT search_text, COUNT(*) AS freq
            FROM search_log
            WHERE searched_at > NOW() - INTERVAL '7 days'
            GROUP BY search_text
            ORDER BY freq DESC
            LIMIT 6
            """
        )
        return jsonify(cur.fetchall())

    except Exception as e:
        print("Trending search error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()