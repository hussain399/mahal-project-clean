# routes/gridlist_routes.py
from flask import Blueprint, jsonify, request, current_app,request, send_from_directory
from flask_cors import CORS
from db import get_db_connection
from psycopg2.extras import RealDictCursor
import base64
from datetime import datetime, timezone, date 
import random

# 🔥 NEW: for resizing images to fixed size
from PIL import Image
from io import BytesIO

gridlist_bp = Blueprint("gridlist_bp", __name__)
CORS(gridlist_bp)


# =========================================================
# 1. Serve product multi images  (product_images is BYTEA[])
#    /api/image/<product_id>/<index>
#    ALWAYS RETURN FIXED SIZE (e.g. 300x300)
# =========================================================
@gridlist_bp.route("/image/<int:product_id>/<int:index>")
def serve_multi_image(product_id, index):
    TARGET_W = 300  # change if you want different size
    TARGET_H = 300

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # product_images is BYTEA[]
        cur.execute(
            "SELECT product_images FROM product_management WHERE product_id = %s",
            (product_id,),
        )
        row = cur.fetchone()

        if not row:
            print(f"[IMAGE] No product row for id={product_id}")
            return "", 404

        images = row.get("product_images")

        if not images:
            print(f"[IMAGE] No image data array for id={product_id}")
            return "", 404

        # Ensure index is valid
        if index < 0 or index >= len(images):
            print(f"[IMAGE] Index {index} out of range for id={product_id}")
            return "", 404

        image_data = images[index]
        if not image_data:
            print(f"[IMAGE] Empty image slot index={index} for id={product_id}")
            return "", 404

        # psycopg2 usually returns BYTEA as memoryview
        if isinstance(image_data, memoryview):
            image_data = image_data.tobytes()

        # It might be raw bytes or base64 text stored in BYTEA.
        try:
            ascii_candidate = image_data.decode("ascii")
            image_bytes = base64.b64decode(ascii_candidate, validate=True)
            print(f"[IMAGE] Decoded base64 image for id={product_id}, index={index}")
        except Exception:
            image_bytes = image_data
            print(f"[IMAGE] Using raw BYTEA image for id={product_id}, index={index}")

        # 🔥 Resize to fixed size using Pillow
        try:
            img = Image.open(BytesIO(image_bytes)).convert("RGB")

            # scale to cover TARGET_W x TARGET_H (like CSS object-fit: cover)
            scale = max(TARGET_W / img.width, TARGET_H / img.height)
            new_w = int(img.width * scale)
            new_h = int(img.height * scale)
            img = img.resize((new_w, new_h), Image.LANCZOS)

            # center crop
            left = (new_w - TARGET_W) // 2
            top = (new_h - TARGET_H) // 2
            right = left + TARGET_W
            bottom = top + TARGET_H
            img = img.crop((left, top, right, bottom))

            # output as JPEG
            buf = BytesIO()
            img.save(buf, format="JPEG", quality=90)
            resized_bytes = buf.getvalue()
            mimetype = "image/jpeg"

        except Exception as e:
            # If Pillow fails, fall back to original bytes
            print(f"[IMAGE] Pillow resize error for id={product_id}, index={index}: {e}")
            resized_bytes = image_bytes
            if image_bytes.startswith(b"\xff\xd8"):
                mimetype = "image/jpeg"
            elif image_bytes.startswith(b"\x89PNG"):
                mimetype = "image/png"
            else:
                mimetype = "application/octet-stream"

        return current_app.response_class(
            resized_bytes,
            mimetype=mimetype,
            headers={"Cache-Control": "public, max-age=86400"},
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[IMAGE] IMAGE FETCH ERROR for id={product_id}, index={index}: {e}")
        return "", 500

    finally:
        cur.close()
        conn.close()


@gridlist_bp.route("/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT 
                c.id, 
                c.name,

                COUNT(pm.product_id) AS product_count,

                (
                    SELECT pm2.product_id
                    FROM product_management pm2
                    WHERE pm2.category_id = c.id
                      AND COALESCE(pm2.flag, 'A') = 'A'
                    LIMIT 1
                ) AS sample_product_id

            FROM category c

            LEFT JOIN product_management pm 
                ON pm.category_id = c.id
                AND COALESCE(pm.flag, 'A') = 'A'

            -- 🔥 FIX: handle NULL / missing flags
            WHERE COALESCE(c.flag, 'A') = 'A'

            GROUP BY c.id, c.name
            ORDER BY c.name ASC
        """)

        rows = cur.fetchall()

        print("🔥 RAW DB ROWS:", rows)  # DEBUG

        host_url = request.host_url.rstrip("/")

        categories = []
        for row in rows:
            product_id = row.get("sample_product_id")

            image_url = None
            if product_id:
                image_url = f"{host_url}/api/image/{product_id}/0"

            categories.append({
                "id": row["id"],
                "name": row["name"],
                "product_count": row["product_count"] or 0,
                "image": image_url
            })

        print("✅ FINAL API OUTPUT:", categories)

        return jsonify(categories), 200

    except Exception as e:
        print("❌ CATEGORY FETCH ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# =========================================================
# 3. Gridlist (with optional category filter & multi images)
# =========================================================
@gridlist_bp.route("/gridlist", methods=["GET"])
def get_gridlist_data():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        category_id = request.args.get("category_id", type=int)
        category_name = request.args.get("category_name", type=str)

        base_sql = """
        SELECT DISTINCT ON (pm.product_id)

            pm.product_id,
            pm.product_name_english,
            pm.product_name_arabic,

            pm.supplier_id,
            pm.company_name_english,
            pm.unit_of_measure,

            pm.price_per_unit,
            pm.currency,
            pm.stock_availability,

            pm.description,
            pm.expiry_date,
            pm.shelf_life,
            pm.expiry_time,

            pm.product_images,

            o.offer_type,
            o.discount_percentage,
            o.flat_amount,
            o.buy_quantity,
            o.get_quantity,

            c.id   AS category_id,
            c.name AS category_name,
            sc.name AS subcategory_name

        FROM product_management pm

        LEFT JOIN category c
            ON pm.category_id = c.id

        LEFT JOIN sub_category sc
            ON pm.sub_category_id = sc.id

        LEFT JOIN offers o
            ON o.product_id = pm.product_id
            AND o.is_active = true
            AND CURRENT_DATE >= o.start_date
            AND CURRENT_DATE <= o.end_date

        WHERE pm.flag = 'A'
        """

        params = []

        if category_id:
            base_sql += " AND pm.category_id = %s"
            params.append(category_id)

        if category_name:
            base_sql += " AND c.name = %s"
            params.append(category_name)

        base_sql += " ORDER BY pm.product_id DESC"

        cur.execute(base_sql, params)
        rows = cur.fetchall()

        products = []
        categories = set()
        suppliers = {}
        max_price = 0

        host_url = request.host_url.rstrip("/")

        for row in rows:

            price_val = float(row.get("price_per_unit") or 0)
            currency = row.get("currency") or "QAR"

            max_price = max(max_price, price_val)

            # ---------------- OFFER LOGIC ----------------
            label = "New"
            offer_text = None

            offer_type = (row.get("offer_type") or "").lower()

            if offer_type == "percentage" and row.get("discount_percentage"):
                label = f"{int(row['discount_percentage'])}% OFF"
                offer_text = label

            elif offer_type == "flat" and row.get("flat_amount"):
                label = f"FLAT {int(row['flat_amount'])} OFF"
                offer_text = label

            elif offer_type == "bogo":
                buy = row.get("buy_quantity") or 1
                get = row.get("get_quantity") or 1
                label = f"BUY {buy} GET {get}"
                offer_text = label

            # ---------------- IMAGES ----------------
            img_array = row.get("product_images") or []

            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array)
                if img
            ]

            img1 = images[0] if images else None
            img2 = images[1] if len(images) > 1 else img1

            price_str = f"ر.ق{int(price_val)}.00 {currency}"

            if row.get("category_name"):
                categories.add(row["category_name"])

            suppliers[row["supplier_id"]] = row["company_name_english"]

            products.append(
                {
                    "id": row["product_id"],
                    "name": row["product_name_english"],
                    "name_ar": row.get("product_name_arabic"),

                    "supplier_id": row["supplier_id"],
                    "supplier_name": row["company_name_english"],
                    "unit_of_measure": row.get("unit_of_measure"),

                    "images": images,
                    "img1": img1,
                    "img2": img2,

                    "label": label,
                    "offer_text": offer_text,

                    "offer_type": row.get("offer_type"),
                    "discount_percentage": row.get("discount_percentage"),
                    "flat_amount": row.get("flat_amount"),
                    "buy_quantity": row.get("buy_quantity"),
                    "get_quantity": row.get("get_quantity"),

                    "price": price_str,
                    "price_numeric": price_val,
                    "currency": currency,

                    "reviews": 0,
                    "rating": 4,

                    "category": row.get("category_name"),
                    "subcategory": row.get("subcategory_name"),

                    "stock": row.get("stock_availability") or 0,

                    "description": row.get("description"),

                    "expiry_date": str(row.get("expiry_date")) if row.get("expiry_date") else None,
                    "shelf_life": row.get("shelf_life"),
                    "expiry_time": row.get("expiry_time"),
                }
            )

        supplier_filter = [
            {"supplier_id": sid, "company_name_english": sname}
            for sid, sname in suppliers.items()
        ]

        return jsonify(
            {
                "products": products,
                "categories": sorted(list(categories)),
                "suppliers": supplier_filter,
                "filters": {
                    "price_max": max_price if max_price else 1000
                },
            }
        ), 200

    except Exception as e:
        print("GRIDLIST ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


#  =========================================================
#  4. Trending products (random, stable every 5 days, multi images)
#  =========================================================
@gridlist_bp.route("/trending", methods=["GET"])
def get_trending_products():
    """
    Optional:
        ?category_id=1
        ?category_name=Vegetables

    - Same data shape as /gridlist 'products'
    - Random subset, but same for ~5 days window.
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        category_id = request.args.get("category_id", type=int)
        category_name = request.args.get("category_name", type=str)

        base_sql = """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.product_name_arabic,

                pm.supplier_id,
                pm.company_name_english,
                pm.unit_of_measure,

                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,

                pm.description,
                pm.expiry_date,
                pm.shelf_life,
                pm.expiry_time,

                pm.product_images,

                c.id   AS category_id,
                c.name AS category_name,
                sc.name AS subcategory_name
            FROM product_management pm
            LEFT JOIN category c ON pm.category_id = c.id
            LEFT JOIN sub_category sc ON pm.sub_category_id = sc.id
            WHERE pm.flag = 'A'
        """

        params = []
        if category_id is not None:
            base_sql += " AND pm.category_id = %s"
            params.append(category_id)
        elif category_name:
            base_sql += " AND c.name = %s"
            params.append(category_name)

        base_sql += " ORDER BY pm.product_id DESC"

        cur.execute(base_sql, params)
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for row in rows:
            price_val = float(row.get("price_per_unit") or 0)
            currency = row.get("currency") or "QAR"

            # multi images
            img_array = row.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array)
                if img
            ]

            img1 = images[0] if len(images) > 0 else None
            img2 = images[1] if len(images) > 1 else img1

            label = "New"
            price_str = f"ر.ق{int(price_val)}.00 {currency}"

            products.append(
                {
                    "id": row["product_id"],
                    "name": row["product_name_english"],
                    "name_ar": row.get("product_name_arabic"),
                    "supplier_id": row["supplier_id"],
                    "supplier_name": row["company_name_english"],
                    "unit_of_measure": row.get("unit_of_measure"),

                    "images": images,
                    "img1": img1,
                    "img2": img2,

                    "label": label,
                    "price": price_str,
                    "price_numeric": price_val,
                    "currency": currency,
                    "reviews": 0,
                    "rating": 4,
                    "category": row.get("category_name"),
                    "subcategory": row.get("subcategory_name"),
                    "stock": row.get("stock_availability") or 0,
                    "offer_title": None,
                    "offer_start": None,
                    "offer_end": None,
                    "description": row.get("description"),
                    "expiry_date": str(row.get("expiry_date")) if row.get("expiry_date") else None,
                    "shelf_life": row.get("shelf_life"),
                    "expiry_time": row.get("expiry_time"),
                }
            )

        # deterministic random per 5-day window
        if products:
            window_seconds = 5 * 24 * 3600
            now_ts = datetime.now(timezone.utc).timestamp()
            period_index = int(now_ts // window_seconds)

            rnd = random.Random(period_index)
            rnd.shuffle(products)

            products = products[:12]  # limit to 8 items

        return jsonify({"products": products}), 200

    except Exception as e:
        print("TRENDING ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 5. Similar products (same category as given product, multi images)
# =========================================================
@gridlist_bp.route("/similar", methods=["GET"])
def get_similar_products():
    """
    Usage:
        /api/similar?product_id=123
    Returns:
        { "products": [ ... ] }  -- SAME SHAPE as /gridlist, /trending
    """
    product_id = request.args.get("product_id", type=int)
    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1) Find that product's category_id
        cur.execute(
            """
            SELECT category_id
            FROM product_management
            WHERE product_id = %s AND flag = 'A'
            """,
            (product_id,),
        )
        row = cur.fetchone()
        if not row or not row.get("category_id"):
            return jsonify({"products": []}), 200

        category_id = row["category_id"]

        # 2) Get other products in same category (exclude original one)
        cur.execute(
            """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.product_name_arabic,

                pm.supplier_id,
                pm.company_name_english,
                pm.unit_of_measure,

                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,

                pm.description,
                pm.expiry_date,
                pm.shelf_life,
                pm.expiry_time,

                pm.product_images,

                c.id   AS category_id,
                c.name AS category_name,
                sc.name AS subcategory_name
            FROM product_management pm
            LEFT JOIN category c ON pm.category_id = c.id
            LEFT JOIN sub_category sc ON pm.sub_category_id = sc.id
            WHERE pm.flag = 'A'
              AND pm.category_id = %s
              AND pm.product_id <> %s
            ORDER BY pm.product_id DESC
            LIMIT 10
            """,
            (category_id, product_id),
        )
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for r in rows:
            price_val = float(r.get("price_per_unit") or 0)
            currency = r.get("currency") or "QAR"

            img_array = r.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{r['product_id']}/{i}"
                for i, img in enumerate(img_array)
                if img
            ]

            img1 = images[0] if len(images) > 0 else None
            img2 = images[1] if len(images) > 1 else img1

            # label / offers removed -> just "New"
            label = "New"
            price_str = f"ر.ق{int(price_val)}.00 {currency}"

            products.append(
                {
                    "id": r["product_id"],
                    "name": r["product_name_english"],
                    "name_ar": r.get("product_name_arabic"),
                    "supplier_id": r["supplier_id"],
                    "supplier_name": r["company_name_english"],
                    "unit_of_measure": r.get("unit_of_measure"),

                    "images": images,
                    "img1": img1,
                    "img2": img2,

                    "label": label,
                    "price": price_str,
                    "price_numeric": price_val,
                    "currency": currency,
                    "reviews": 0,
                    "rating": 4,
                    "category": r.get("category_name"),
                    "subcategory": r.get("subcategory_name"),
                    "stock": r.get("stock_availability") or 0,
                    "offer_title": None,
                    "offer_start": None,
                    "offer_end": None,
                    "description": r.get("description"),
                    "expiry_date": str(r.get("expiry_date")) if r.get("expiry_date") else None,
                    "shelf_life": r.get("shelf_life"),
                    "expiry_time": r.get("expiry_time"),
                }
            )

        return jsonify({"products": products}), 200

    except Exception as e:
        print("SIMILAR PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 6. Related products (same category, excluding current ID)
# =========================================================
@gridlist_bp.route("/related", methods=["GET"])
def get_related_products():
    """
    Usage:
        /api/related?product_id=123
    Returns:
        { "products": [ ... ] } -- simpler shape for related products
    """
    product_id = request.args.get("product_id", type=int)
    if not product_id:
        return jsonify({"error": "product_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1️⃣ Get category of current product
        cur.execute(
            """
            SELECT category_id 
            FROM product_management 
            WHERE product_id = %s AND flag='A'
            """,
            (product_id,),
        )
        row = cur.fetchone()
        if not row or not row.get("category_id"):
            return jsonify({"products": []}), 200

        category_id = row["category_id"]

        # 2️⃣ Fetch related products (same category except current one)
        cur.execute(
            """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.product_name_arabic,
                pm.supplier_id,
                pm.company_name_english,
                pm.unit_of_measure,
                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,
                pm.description,
                pm.product_images,
                c.name AS category_name
            FROM product_management pm
            LEFT JOIN category c ON pm.category_id = c.id
            WHERE pm.flag='A'
              AND pm.category_id = %s
              AND pm.product_id <> %s
            ORDER BY pm.product_id DESC
            LIMIT 10
            """,
            (category_id, product_id),
        )
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for r in rows:
            # Format image URLs
            img_array = r.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{r['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            products.append(
                {
                    "id": r["product_id"],
                    "name": r["product_name_english"],
                    "name_ar": r.get("product_name_arabic"),
                    "supplier_name": r["company_name_english"],
                    "images": images,
                    "img1": images[0] if len(images) > 0 else None,
                    "price": f"ر.ق{int(r.get('price_per_unit') or 0)}.00 {r.get('currency', '')}",
                    "price_numeric": float(r.get("price_per_unit") or 0),
                    "currency": r.get("currency") or "QAR",
                    "stock": r.get("stock_availability") or 0,
                    "category": r.get("category_name"),
                }
            )

        return jsonify({"products": products}), 200

    except Exception as e:
        print("RELATED PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 7. Single product detail (for Product page)
#     /api/product/<product_id>
#     - returns description + short_description (~180 chars)
# =========================================================
# =========================================================
# 7. Single product detail (for Product page)
#     /api/product/<product_id>
# =========================================================
@gridlist_bp.route("/product/<int:product_id>", methods=["GET"])
def get_product_detail(product_id):

    promo_id = request.args.get("promo", type=int)
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute(
            """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.product_name_arabic,

                pm.supplier_id,
                pm.company_name_english,
                pm.unit_of_measure,
                pm.country_of_origin,

                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,

                pm.description,
                pm.expiry_date,
                pm.shelf_life,
                pm.expiry_time,

                pm.product_images,

                c.id   AS category_id,
                c.name AS category_name,
                sc.name AS subcategory_name,

                -- 🔥 OFFER DATA
                o.offer_id,
                o.offer_title,
                o.discount_percentage,
                o.discount_value,
                o.flat_amount,
                o.offer_type,
                o.buy_quantity,
                o.get_quantity,

                CASE
                    WHEN CURRENT_DATE < o.start_date THEN 'UPCOMING'
                    WHEN CURRENT_DATE > o.end_date THEN 'EXPIRED'
                    ELSE 'ACTIVE'
                END AS offer_status

            FROM product_management pm

            LEFT JOIN category c ON pm.category_id = c.id
            LEFT JOIN sub_category sc ON pm.sub_category_id = sc.id

            LEFT JOIN offers o
                ON pm.product_id = o.product_id
                --- ON (
                ---     pm.product_id = o.product_id
                --- )
                --- OR (
                ---     o.category_id = pm.category_id
                --- )
                AND o.is_active = true
                AND CURRENT_DATE BETWEEN o.start_date AND o.end_date

            WHERE pm.flag = 'A'
            AND pm.product_id = %s
            LIMIT 1
            """,
            (product_id,),
        )
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Product not found"}), 404

        host_url = request.host_url.rstrip("/")

        price_val = float(row.get("price_per_unit") or 0)
        offer_label = None
        discounted_price = price_val
        offer_data = None
        original_price = None
        has_offer = False

        if row.get("offer_id"):

            has_offer = True
            original_price = price_val

            offer_type = row.get("offer_type")

            if offer_type == "Percentage" and row.get("discount_percentage"):
                pct = float(row["discount_percentage"])
                discounted_price = price_val - (price_val * pct / 100)
                offer_label = f"{int(pct)}% OFF"

            elif offer_type == "Flat" and row.get("flat_amount"):
                flat = float(row["flat_amount"])
                discounted_price = max(price_val - flat, 0)
                offer_label = f"{int(flat)} OFF"

            elif offer_type == "BOGO":
                offer_label = f"BUY {row.get('buy_quantity')} GET {row.get('get_quantity')}"

            offer_data = {
                "offer_type": offer_type,
                "discount_percentage": row.get("discount_percentage"),
                "flat_amount": row.get("flat_amount"),
                "buy_quantity": row.get("buy_quantity"),
                "get_quantity": row.get("get_quantity"),
                "offer_status": row.get("offer_status") or "ACTIVE",
            }

        if promo_id:

            cur.execute("""
                SELECT p.id, p.offer_type, p.offer_value
                FROM promotions p
                JOIN promotion_suppliers ps
                    ON ps.promotion_id = p.id
                WHERE p.id = %s
                AND ps.supplier_id = %s
                AND ps.status = 'ACCEPTED'
                AND p.status IN ('ACTIVE','APPROVED')
                AND CURRENT_DATE BETWEEN p.start_date AND p.end_date
            """, (promo_id, row["supplier_id"]))

        else:

            cur.execute("""
                SELECT id, offer_type, offer_value
                FROM promotions
                WHERE status IN ('ACTIVE','APPROVED')
                AND CURRENT_DATE BETWEEN start_date AND end_date
                AND (
                    (target_type = 'PRODUCT'
                    AND (target_ids::jsonb) @> to_jsonb(ARRAY[%s]))
                    OR
                    (target_type = 'CATEGORY'
                    AND (target_ids::jsonb) @> to_jsonb(ARRAY[%s]))
                    OR
                    (target_type = 'FESTIVAL'
                    AND (target_ids::jsonb) @> to_jsonb(ARRAY[%s]))
                )
                ORDER BY priority_level ASC
                LIMIT 1
            """, (product_id, row["category_id"], product_id))


        promo = cur.fetchone()

        offers_list = []

        if row.get("offer_id"):

            offer_type = row.get("offer_type")

            if offer_type == "Percentage":
                offers_list.append({
                    "offer_type": "PERCENTAGE",
                    "offer_value": float(row.get("discount_percentage") or 0)
                })

            elif offer_type == "Flat":
                offers_list.append({
                    "offer_type": "FLAT",
                    "offer_value": float(row.get("flat_amount") or 0)
                })

        if promo:

            offers_list.append({
                "source": "PROMOTION",
                "offer_type": promo["offer_type"],
                "offer_value": float(promo["offer_value"])
            })

        best_price = price_val
        best_offer = None

        for off in offers_list:

            if off["offer_type"] == "PERCENTAGE":
                discounted = price_val - (price_val * off["offer_value"] / 100)

            elif off["offer_type"] == "FLAT":
                discounted = price_val - off["offer_value"]

            else:
                continue

            if discounted < best_price:
                best_price = discounted
                best_offer = off

        if best_offer:

            has_offer = True
            original_price = price_val
            discounted_price = best_price

            if best_offer["offer_type"] == "PERCENTAGE":
                offer_label = f"{int(best_offer['offer_value'])}% OFF"

            elif best_offer["offer_type"] == "FLAT":
                offer_label = f"₹{int(best_offer['offer_value'])} OFF"

            offer_data = best_offer

        currency = row.get("currency") or "QAR"

        img_array = row.get("product_images") or []
        if not isinstance(img_array, (list, tuple)):
            img_array = []

        images = [
            f"{host_url}/api/image/{row['product_id']}/{i}"
            for i, img in enumerate(img_array)
            if img
        ]

        img1 = images[0] if len(images) > 0 else None
        img2 = images[1] if len(images) > 1 else img1

        label = "New"
        price_str = f"ر.ق{int(price_val)}.00 {currency}"

        full_desc = row.get("description") or ""
        full_desc = full_desc.strip() if isinstance(full_desc, str) else ""

        if full_desc:
            short_desc = (
                full_desc[:180] + "..."
                if len(full_desc) > 180
                else full_desc
            )
        else:
            short_desc = ""

        product = {
            "id": row["product_id"],
            "name": row["product_name_english"],
            "name_ar": row.get("product_name_arabic"),
            "supplier_id": row["supplier_id"],
            "supplier_name": row["company_name_english"],
            "unit_of_measure": row.get("unit_of_measure"),
            "country_of_origin": row.get("country_of_origin"),

            "images": images,
            "img1": img1,
            "img2": img2,

            "label": label,
            "price": price_str,
            "price_numeric": price_val,
            "discounted_price": discounted_price,
            "original_price": original_price,
            "offer_label": offer_label,
            "offer": offer_data,
            "has_offer": has_offer,

            "currency": currency,
            "reviews": 0,
            "rating": 4,
            "category": row.get("category_name"),
            "subcategory": row.get("subcategory_name"),
            "stock": row.get("stock_availability") or 0,

            "description": full_desc,
            "short_description": short_desc,
            "expiry_date": str(row.get("expiry_date")) if row.get("expiry_date") else None,
            "shelf_life": row.get("shelf_life"),
            "expiry_time": row.get("expiry_time"),
        }

        return jsonify({"product": product}), 200

    except Exception as e:
        print("PRODUCT DETAIL ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# =========================================================
# 7. Our Products tabs (special / new / bestseller)
#     - Uses gridlist-style query for "new" & "special"
#     - Uses trending-style logic for "bestseller"
#     - FRONTEND: /api/tab-products
# =========================================================
@gridlist_bp.route("/tab-products", methods=["GET"])
def get_tab_products():
    """
    Returns:
    {
        "special":   [ ...products... ],
        "new":       [ ...products... ],
        "bestseller":[ ...products... ]
    }

    All product objects have SAME SHAPE as /gridlist & /trending:
    - id, name, supplier_name, images, img1, img2,
      price, price_numeric, currency, rating, stock, description, ...
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ---------- 1) Base query (same as /gridlist) ----------
        base_sql = """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.product_name_arabic,

                pm.supplier_id,
                pm.company_name_english       AS supplier_name,
                pm.unit_of_measure,

                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,

                pm.description,
                pm.expiry_date,
                pm.shelf_life,
                pm.expiry_time,

                pm.product_images,

                c.id   AS category_id,
                c.name AS category_name,
                sc.name AS subcategory_name
            FROM product_management pm
            LEFT JOIN category c ON pm.category_id = c.id
            LEFT JOIN sub_category sc ON pm.sub_category_id = sc.id
            WHERE pm.flag = 'A'
            ORDER BY pm.product_id DESC
        """

        cur.execute(base_sql)
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        all_products = []

        for row in rows:
            price_val = float(row.get("price_per_unit") or 0)
            currency = row.get("currency") or "QAR"

            # ----- build images list from BYTEA[] -----
            img_array = row.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array)
                if img
            ]

            img1 = images[0] if len(images) > 0 else None
            img2 = images[1] if len(images) > 1 else img1

            label = "New"
            price_str = f"ر.ق{int(price_val)}.00 {currency}"

            all_products.append(
                {
                    "id": row["product_id"],
                    "name": row["product_name_english"],
                    "name_ar": row.get("product_name_arabic"),
                    "supplier_id": row["supplier_id"],
                    "supplier_name": row["supplier_name"],
                    "unit_of_measure": row.get("unit_of_measure"),

                    "images": images,
                    "img1": img1,
                    "img2": img2,

                    "label": label,
                    "price": price_str,
                    "price_numeric": price_val,
                    "currency": currency,
                    "reviews": 0,
                    "rating": 4,
                    "category": row.get("category_name"),
                    "subcategory": row.get("subcategory_name"),
                    "stock": row.get("stock_availability") or 0,
                    "offer_title": None,
                    "offer_start": None,
                    "offer_end": None,
                    "description": row.get("description"),
                    "expiry_date": str(row.get("expiry_date")) if row.get("expiry_date") else None,
                    "shelf_life": row.get("shelf_life"),
                    "expiry_time": row.get("expiry_time"),
                }
            )

        # ---------- 2) Build "new" & "special" from gridlist ----------
        # Most recent 8 as "new"
        new_products = all_products[:8]

        # Next 8 as "special" if available, else reuse "new"
        if len(all_products) > 8:
            special_products = all_products[8:16]
        else:
            special_products = all_products[:8]

        # ---------- 3) Build "bestseller" using /trending-style logic ----------
        # Deterministic random over all_products, same for 5-day window
        bestseller_products = []
        if all_products:
            window_seconds = 5 * 24 * 3600
            now_ts = datetime.now(timezone.utc).timestamp()
            period_index = int(now_ts // window_seconds)

            rnd = random.Random(period_index)
            shuffled = all_products[:]  # copy
            rnd.shuffle(shuffled)

            bestseller_products = shuffled[:8]

        return jsonify(
            {
                "special": special_products,
                "new": new_products,
                "bestseller": bestseller_products,
            }
        ), 200

    except Exception as e:
        print("TAB PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 8. Featured Products (Random 10 products)
# =========================================================
@gridlist_bp.route("/featured-products", methods=["GET"])
def get_featured_products():
    """
    Returns random 10 products for 'Featured' tab
    Same data format as gridlist/trending
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Fetch all active products
        query = """
            SELECT
                product_id,
                product_name_english,
                company_name_english,
                price_per_unit,
                currency,
                product_images,
                stock_availability,
                description
            FROM product_management
            WHERE flag = 'A'
            ORDER BY RANDOM()
            LIMIT 10
        """
        cur.execute(query)
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for row in rows:
            # Handle image array
            img_array = row.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            products.append(
                {
                    "id": row["product_id"],
                    "name": row["product_name_english"],
                    "supplier_name": row["company_name_english"],
                    "price": f"ر.ق{int(row.get('price_per_unit') or 0)}.00 {row.get('currency', '')}",
                    "price_numeric": float(row.get("price_per_unit") or 0),
                    "currency": row.get("currency") or "QAR",
                    "images": images,
                    "img1": images[0] if images else None,
                    "img2": images[1] if len(images) > 1 else images[0] if images else None,
                    "rating": 4,
                    "stock": row.get("stock_availability", 0),
                    "label": "New",
                    "description": row.get("description"),
                }
            )

        return jsonify({"products": products}), 200

    except Exception as e:
        print("FEATURED PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 9. Home Tab Products (latest 8 products)
# =========================================================
@gridlist_bp.route("/home-products", methods=["GET"])
def get_home_products():
    """
    Returns latest 8 products for HOME tab (ProductTabHome.jsx)
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        query = """
            SELECT
                product_id,
                product_name_english,
                company_name_english,
                price_per_unit,
                currency,
                product_images,
                stock_availability,
                description
            FROM product_management
            WHERE flag = 'A'
            ORDER BY product_id DESC
            LIMIT 8
        """
        cur.execute(query)
        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for row in rows:
            img_array = row.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            products.append(
                {
                    "id": row["product_id"],
                    "title": row["product_name_english"],
                    "supplier_name": row["company_name_english"],
                    "price": f"ر.ق{int(row.get('price_per_unit') or 0)}.00 {row.get('currency', '')}",
                    "price_numeric": float(row.get("price_per_unit") or 0),
                    "currency": row.get("currency") or "QAR",
                    "img1": images[0] if images else None,
                    "img2": images[1] if len(images) > 1 else images[0] if images else None,
                    "rating": 4,
                    "stars": 4,
                    "label": "New",
                }
            )

        return jsonify({"products": products}), 200

    except Exception as e:
        print("HOME TAB PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@gridlist_bp.route("/special-products", methods=["GET"])
def get_special_products():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ⏱️ 6-hour stable window
        from datetime import datetime, timezone
        import random

        window_seconds = 6 * 3600
        now_ts = datetime.now(timezone.utc).timestamp()
        period_index = int(now_ts // window_seconds)

        # deterministic random seed
        rnd = random.Random(period_index)

        # 👉 Step 1: get all categories
        cur.execute("""
            SELECT id FROM category
            WHERE flag = 'A'
        """)
        categories = [c["id"] for c in cur.fetchall()]

        products = []
        host_url = request.host_url.rstrip("/")

        # 👉 Step 2: pick ONE random product per category
        for cat_id in categories:
            cur.execute("""
                SELECT
                    product_id,
                    product_name_english,
                    company_name_english,
                    price_per_unit,
                    currency,
                    product_images,
                    stock_availability,
                    description
                FROM product_management
                WHERE flag = 'A' AND category_id = %s
            """, (cat_id,))

            rows = cur.fetchall()
            if not rows:
                continue

            # 🔥 deterministic random pick
            selected = rnd.choice(rows)

            img_array = selected.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{selected['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            price_val = float(selected.get("price_per_unit") or 0)
            currency = selected.get("currency") or "QAR"
            price_str = f"ر.ق{int(price_val)}.00 {currency}"

            products.append({
                "id": selected["product_id"],
                "title": selected["product_name_english"],
                "supplier_name": selected["company_name_english"],
                "price": price_str,
                "price_numeric": price_val,
                "currency": currency,
                "img1": images[0] if images else None,
                "img2": images[1] if len(images) > 1 else (images[0] if images else None),
                "label": "New",
                "old": None,
                "stars": 4,
            })

        # 👉 Step 3: shuffle & take only 8
        rnd.shuffle(products)
        products = products[:8]

        return jsonify({"products": products}), 200

    except Exception as e:
        print("SPECIAL PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# X. Deals of the day (for DealsOfTheDay.jsx)
# =========================================================
@gridlist_bp.route("/deals-of-the-day", methods=["GET"])
def get_deals_of_the_day():
    """
    Returns a random subset of products (deals of the day)
    shaped for DealsOfTheDay.jsx
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1️⃣ Take some active products
        cur.execute(
            """
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.price_per_unit,
                pm.currency,
                pm.product_images
            FROM product_management pm
            WHERE pm.flag = 'A'
            ORDER BY pm.product_id DESC
            LIMIT 40
            """
        )
        rows = cur.fetchall()
        if not rows:
            return jsonify({"products": []}), 200

        # 2️⃣ Deterministic shuffle per 3-hour window (same set for 3 hours)
        now_ts = datetime.now(timezone.utc).timestamp()
        window_seconds = 3 * 3600
        period_index = int(now_ts // window_seconds)

        rnd = random.Random(period_index)
        rnd.shuffle(rows)

        # 5–10 products for the slider
        rows = rows[:10]

        host_url = request.host_url.rstrip("/")
        products = []

        for r in rows:
            # Images from BYTEA[]
            img_array = r.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{r['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            img1 = images[0] if len(images) > 0 else None
            img2 = images[1] if len(images) > 1 else img1

            price_val = float(r.get("price_per_unit") or 0)
            currency = r.get("currency") or "QAR"

            new_price_str = f"ر.ق{int(price_val)}.00 {currency}"

            # old price = +10% (fake discount) if price > 0
            if price_val > 0:
                old_val = int(price_val * 1.10)
                old_price_str = f"ر.ق{old_val}.00 {currency}"
                label = "-10%"
            else:
                old_price_str = None
                label = "New"

            products.append(
                {
                    "id": r["product_id"],
                    "name": r["product_name_english"],
                    "img1": img1,
                    "img2": img2,
                    "newPrice": new_price_str,
                    "oldPrice": old_price_str,
                    "label": label,
                    "rating": 4,  # default rating (you can make dynamic later)
                }
            )

        return jsonify({"products": products}), 200

    except Exception as e:
        print("DEALS OF THE DAY ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# =========================================================
#  🔴 Delete Product (Soft Delete / Hard Delete Option)
# =========================================================
@gridlist_bp.route("/delete-product/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 👉 HARD DELETE (permanent delete)
        cur.execute(
            "DELETE FROM product_management WHERE product_id = %s",
            (product_id,),
        )

        # 👉 OR use SOFT DELETE instead (safer)
        cur.execute(
            "UPDATE product_management SET flag='D' WHERE product_id = %s",
            (product_id,),
        )

        conn.commit()
        return jsonify({"success": True, "message": "Product deleted"}), 200

    except Exception as e:
        conn.rollback()
        print("DELETE ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
        

@gridlist_bp.route("/deals", methods=["GET"])
def get_deals():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    today = date.today()

    try:
        query = """
            SELECT 
                o.*,
                pm.product_id,
                pm.product_name_english,
                pm.price_per_unit,
                pm.currency,
                pm.product_images
            FROM offers o
            LEFT JOIN product_management pm 
                ON o.product_id = pm.product_id
            WHERE o.is_active = true
              AND o.start_date <= %s
              AND o.end_date >= %s
              AND pm.flag = 'A'
            ORDER BY o.is_featured DESC, o.created_at DESC
            LIMIT 20
        """

        cur.execute(query, (today, today))
        rows = cur.fetchall()

        deals = []
        host_url = request.host_url.rstrip("/")

        for o in rows:

            # =========================
            # 🖼 IMAGE
            # =========================
            img_array = o.get("product_images") or []

            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{o['product_id']}/{i}"
                for i, img in enumerate(img_array) if img
            ]

            image = images[0] if images else o.get("offer_image")

            # =========================
            # 💰 PRICE CALCULATION
            # =========================
            base_price = float(o.get("price_per_unit") or 0)

            if base_price <= 0:
                continue  # skip invalid

            new_price = base_price
            old_price = base_price
            discount_percent = 0
            deal_title = ""

            # 🔥 Percentage discount
            if o["offer_type"] == "Percentage" and o.get("discount_percentage"):
                discount_percent = float(o["discount_percentage"])
                new_price = base_price - (base_price * discount_percent / 100)
                deal_title = f"{int(discount_percent)}% OFF"

            # 🔥 Flat discount
            elif o["discount_type"] == "Flat" and o.get("flat_amount"):
                flat = float(o["flat_amount"])
                new_price = base_price - flat
                discount_percent = (flat / base_price) * 100
                deal_title = f"₹{int(flat)} OFF"

            # 🔥 Buy X Get Y
            elif o.get("buy_quantity") and o.get("get_quantity"):
                deal_title = f"Buy {o['buy_quantity']} Get {o['get_quantity']}"
                discount_percent = 0

            # 🔥 Free delivery
            elif o.get("free_delivery"):
                deal_title = "Free Delivery"

            else:
                deal_title = o.get("offer_title") or "Special Offer"

            # prevent negative price
            new_price = max(new_price, 0)

            # =========================
            # 📦 FINAL OBJECT
            # =========================
            deals.append({
                "id": o["offer_id"],
                "product_id": o["product_id"],

                "deal_title": deal_title,
                "name": o.get("product_name_english") or o.get("offer_title"),

                "price": round(new_price, 2),
                "old_price": round(old_price, 2),
                "off": int(discount_percent),

                "currency": o.get("currency") or "INR",

                "image": image,
                "images": images,

                "qty": "Limited Offer",

                "start_date": str(o.get("start_date")),
                "end_date": str(o.get("end_date")),
            })

        return jsonify(deals), 200

    except Exception as e:
        print("❌ DEALS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@gridlist_bp.route("/suppliers", methods=["GET"])
def get_suppliers():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT DISTINCT
                supplier_id,
                company_name_english
            FROM product_management
            WHERE flag = 'A'
        """)

        rows = cur.fetchall()
        host_url = request.host_url.rstrip("/")

        suppliers = []

        for r in rows:
            supplier_id = r["supplier_id"]

            # 🔥 GET ONE PRODUCT IMAGE
            cur.execute("""
                SELECT product_id
                FROM product_management
                WHERE supplier_id = %s
                AND flag = 'A'
                LIMIT 1
            """, (supplier_id,))

            product = cur.fetchone()

            img_url = (
                f"{host_url}/api/image/{product['product_id']}/0"
                if product else None
            )

            suppliers.append({
                "id": supplier_id,
                "name": r["company_name_english"],

                # ✅ ALL VERIFIED
                "verified": True,

                "rating": round(4 + (supplier_id % 5) * 0.1, 1),
                "delivery": "Fast Delivery",
                "minOrder": "Min Order ₹5000",
                "image": img_url
            })

        return jsonify({"suppliers": suppliers}), 200

    except Exception as e:
        print("SUPPLIER ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT DISTINCT
                supplier_id,
                company_name_english
            FROM product_management
            WHERE flag = 'A'
        """)

        rows = cur.fetchall()
        host_url = request.host_url.rstrip("/")

        suppliers = []

        for r in rows:
            supplier_id = r["supplier_id"]

            # 🔥 GET ONE PRODUCT IMAGE
            cur.execute("""
                SELECT product_id
                FROM product_management
                WHERE supplier_id = %s
                AND flag = 'A'
                LIMIT 1
            """, (supplier_id,))

            product = cur.fetchone()

            img_url = (
                f"{host_url}/api/image/{product['product_id']}/0"
                if product else None
            )

            suppliers.append({
                "id": supplier_id,
                "name": r["company_name_english"],

                # ✅ ALL VERIFIED
                "verified": True,

                "rating": round(4 + (supplier_id % 5) * 0.1, 1),
                "delivery": "Fast Delivery",
                "minOrder": "Min Order ₹5000",
                "image": img_url
            })

        return jsonify({"suppliers": suppliers}), 200

    except Exception as e:
        print("SUPPLIER ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT DISTINCT
                supplier_id,
                company_name_english
            FROM product_management
            WHERE flag = 'A'
        """)

        rows = cur.fetchall()
        host_url = request.host_url.rstrip("/")

        suppliers = []

        for r in rows:
            supplier_id = r["supplier_id"]

            # 🔥 GET ONE PRODUCT IMAGE OF THIS SUPPLIER
            cur.execute("""
                SELECT product_id
                FROM product_management
                WHERE supplier_id = %s
                AND flag = 'A'
                LIMIT 1
            """, (supplier_id,))

            product = cur.fetchone()

            if product:
                img_url = f"{host_url}/api/image/{product['product_id']}/0"
            else:
                img_url = None

            suppliers.append({
                "id": supplier_id,
                "name": r["company_name_english"],
                "verified": supplier_id % 2 == 0,
                "rating": round(4 + (supplier_id % 5) * 0.1, 1),
                "delivery": "Fast Delivery",
                "minOrder": "Min Order ₹5000",

                # ✅ USE PRODUCT IMAGE
                "image": img_url
            })

        return jsonify({"suppliers": suppliers}), 200

    except Exception as e:
        print("SUPPLIER ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT 
                product_id,
                product_name_english,
                price_per_unit,
                old_price
            FROM product_management
            WHERE supplier_id = %s
            AND flag = 'A'
            ORDER BY product_id DESC
        """, (supplier_id,))

        rows = cur.fetchall()
        host_url = request.host_url.rstrip("/")

        products = []

        for r in rows:
            products.append({
                "id": r["product_id"],
                "name": r["product_name_english"],
                "price": r["price_per_unit"],
                "oldPrice": r.get("old_price", 0),

                # 🔥 PRODUCT IMAGE (IMPORTANT)
                "image": f"{host_url}/api/image/{r['product_id']}/0"
            })

        return jsonify({"products": products}), 200

    except Exception as e:
        print("SUPPLIER PRODUCTS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# ✅ SUPPLIER IMAGE API
@gridlist_bp.route("/supplier-products/<int:supplier_id>", methods=["GET"])
def get_supplier_products(supplier_id):
    conn = get_db_connection()
