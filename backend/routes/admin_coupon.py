
from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone
from backend.db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action
# 
admin_coupon_bp = Blueprint(
    "admin_coupon_bp",
    __name__,
    url_prefix="/api/v1/coupons"
)

# =========================================================
# 🔧 INTERNAL UTILITIES
# =========================================================

def calculate_discount(subtotal, coupon):
    if coupon["discount_type"] == "PERCENTAGE":
        raw = subtotal * float(coupon["discount_value"]) / 100
    else:
        raw = float(coupon["discount_value"])

    if coupon["max_discount"] is not None:
        raw = min(raw, float(coupon["max_discount"]))

    return round(raw, 2)


def split_discount(discount, absorb_type, supplier_share_percent):
    if absorb_type == "PLATFORM":
        return discount, 0
    elif absorb_type == "SUPPLIER":
        return 0, discount
    else:
        supplier_part = discount * supplier_share_percent / 100
        platform_part = discount - supplier_part
        return round(platform_part, 2), round(supplier_part, 2)




# =========================================================
# 1️⃣ CREATE COUPON
# =========================================================

@admin_coupon_bp.route("/admin/create", methods=["POST"])
@require_admin()
def create_coupon():

    data = request.json
    scope = data.get("scope_type")

    if scope == "CATEGORY" and not data.get("category_ids"):
        return jsonify({"error": "Category coupon requires categories"}), 400

    if scope == "SUPPLIER" and not data.get("supplier_ids"):
        return jsonify({"error": "Supplier coupon requires suppliers"}), 400

    code = data.get("code", "").upper().strip()

    if not code:
        return jsonify({"error": "Coupon code required"}), 400

    if data.get("discount_type") not in ["PERCENTAGE", "FLAT"]:
        return jsonify({"error": "Invalid discount type"}), 400

    if data.get("absorb_type") not in ["PLATFORM", "SUPPLIER", "SHARED"]:
        return jsonify({"error": "Invalid absorb type"}), 400

    if data.get("absorb_type") == "SHARED":
        try:
            share = float(data.get("supplier_share_percent", 0))
        except:
            return jsonify({"error": "Invalid supplier share"}), 400

        if share <= 0 or share > 100:
            return jsonify({"error": "Supplier share must be 1-100"}), 400

    try:
        discount_value = float(data.get("discount_value", 0))
    except:
        return jsonify({"error": "Invalid discount value"}), 400

    if discount_value <= 0:
        return jsonify({"error": "Discount must be greater than 0"}), 400

    if not data.get("start_date") or not data.get("end_date"):
        return jsonify({"error": "Start and end date required"}), 400

    try:
        start_date = datetime.fromisoformat(data["start_date"])
        end_date = datetime.fromisoformat(data["end_date"])
    except:
        return jsonify({"error": "Invalid date format"}), 400

    if start_date >= end_date:
        return jsonify({"error": "Invalid date range"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ================= DUPLICATE CODE =================
        cur.execute("SELECT 1 FROM coupons WHERE code=%s", (code,))
        if cur.fetchone():
            conn.rollback()
            return jsonify({"error": "Coupon code already exists"}), 400

        # ================= CAMPAIGN VALIDATION =================
        campaign_id = data.get("campaign_id")
        if campaign_id:
            cur.execute("SELECT 1 FROM campaigns WHERE campaign_id=%s", (campaign_id,))
            if not cur.fetchone():
                conn.rollback()
                return jsonify({"error": "Invalid campaign_id"}), 400

        # ================= INSERT =================
        cur.execute("""
            INSERT INTO coupons (
                code, title, description,
                discount_type, discount_value,
                min_order_value, max_discount,
                start_date, end_date,
                usage_limit_total, usage_limit_per_restaurant,
                absorb_type, supplier_share_percent,
                first_order_only, stackable,
                campaign_id, priority, total_budget,
                scope_type, approval_status, created_by_admin
            )
            VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
            )
            RETURNING *
        """, (
            code,
            data.get("title"),
            data.get("description"),
            data["discount_type"],
            discount_value,
            data.get("min_order_value", 0),
            data.get("max_discount"),
            data["start_date"],
            data["end_date"],
            data.get("usage_limit_total", 0),
            data.get("usage_limit_per_restaurant", 0),
            data["absorb_type"],
            data.get("supplier_share_percent", 0),
            data.get("first_order_only", False),
            data.get("stackable", False),
            campaign_id,
            data.get("priority", 1),
            data.get("total_budget"),
            scope or "GLOBAL",
            "APPROVED",
            g.admin["admin_id"]
        ))

        coupon = cur.fetchone()
        coupon_id = coupon["coupon_id"]

        # ================= CATEGORY =================
        if scope == "CATEGORY":
            category_ids = data.get("category_ids", [])

            cur.execute("""
                SELECT id FROM category WHERE id = ANY(%s)
            """, (category_ids,))

            valid_ids = [r["id"] for r in cur.fetchall()]

            if len(valid_ids) != len(category_ids):
                conn.rollback()
                return jsonify({"error": "Invalid category IDs"}), 400

            for cat in valid_ids:
                cur.execute("""
                    INSERT INTO coupon_categories (coupon_id, category_id)
                    VALUES (%s,%s)
                    ON CONFLICT DO NOTHING
                """, (coupon_id, cat))

        # ================= SUPPLIER =================
        if scope == "SUPPLIER":
            supplier_ids = data.get("supplier_ids", [])

            cur.execute("""
                SELECT supplier_id FROM supplier_registration
                WHERE supplier_id = ANY(%s)
            """, (supplier_ids,))

            valid_suppliers = [r["supplier_id"] for r in cur.fetchall()]

            if len(valid_suppliers) != len(supplier_ids):
                conn.rollback()
                return jsonify({"error": "Invalid supplier IDs"}), 400

            for sid in valid_suppliers:
                cur.execute("""
                    INSERT INTO coupon_targets (coupon_id, supplier_id)
                    VALUES (%s,%s)
                    ON CONFLICT DO NOTHING
                """, (coupon_id, sid))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="COUPON_CREATE",
            entity_type="COUPON",
            entity_id=coupon_id,
            new_value=coupon,
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Coupon created", "coupon": coupon})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# 2️⃣ UPDATE COUPON
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>", methods=["PUT"])
@require_admin()
def update_coupon(coupon_id):

    data = request.json

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
        SELECT * FROM coupons
        WHERE coupon_id=%s
        FOR UPDATE
        """, (coupon_id,))

        old = cur.fetchone()

        if not old:
            conn.rollback()
            return jsonify({"error": "Coupon not found"}), 404

        if old["end_date"] < datetime.now(timezone.utc):
            conn.rollback()
            return jsonify({"error": "Cannot edit expired coupon"}), 400

        updated_data = {
            "title": data.get("title", old["title"]),
            "description": data.get("description", old["description"]),
            "discount_value": data.get("discount_value", old["discount_value"]),
            "min_order_value": data.get("min_order_value", old["min_order_value"]),
            "max_discount": data.get("max_discount", old["max_discount"]),
            "usage_limit_total": data.get("usage_limit_total", old["usage_limit_total"]),
            "usage_limit_per_restaurant": data.get("usage_limit_per_restaurant", old["usage_limit_per_restaurant"]),
            "priority": data.get("priority", old["priority"]),
            "end_date": data.get("end_date", old["end_date"])
        }

        cur.execute("""
        UPDATE coupons
        SET
            title=%s,
            description=%s,
            discount_value=%s,
            min_order_value=%s,
            max_discount=%s,
            usage_limit_total=%s,
            usage_limit_per_restaurant=%s,
            priority=%s,
            end_date=%s,
            updated_at=NOW()
        WHERE coupon_id=%s
        RETURNING *
        """, (
            updated_data["title"],
            updated_data["description"],
            updated_data["discount_value"],
            updated_data["min_order_value"],
            updated_data["max_discount"],
            updated_data["usage_limit_total"],
            updated_data["usage_limit_per_restaurant"],
            updated_data["priority"],
            updated_data["end_date"],
            coupon_id
        ))

        updated = cur.fetchone()
        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="COUPON_UPDATE",
            entity_type="COUPON",
            entity_id=coupon_id,
            old_value=old,
            new_value=updated,
            ip_address=request.remote_addr
        )

        return jsonify({"message": "Updated", "coupon": updated})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# =========================================================
# 3️⃣ DEACTIVATE COUPON
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>/deactivate", methods=["PATCH"])
@require_admin()
def deactivate_coupon(coupon_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE coupons
        SET is_active=FALSE
        WHERE coupon_id=%s
    """, (coupon_id,))

    conn.commit()

    log_admin_action(
        admin_id=g.admin["admin_id"],
        action="COUPON_DEACTIVATE",
        entity_type="COUPON",
        entity_id=coupon_id,
        ip_address=request.remote_addr
    )

    cur.close()
    conn.close()

    return jsonify({"message": "Coupon deactivated"})


# =========================================================
# 4️⃣ ADD TARGET
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>/targets", methods=["POST"])
@require_admin()
def add_target(coupon_id):

    data = request.json

    if not any([
        data.get("restaurant_id"),
        data.get("supplier_id")
    ]):
        return jsonify({"error": "Restaurant or supplier required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        cur.execute("""
        INSERT INTO coupon_targets
        (coupon_id, restaurant_id, supplier_id)
        VALUES (%s,%s,%s)
        ON CONFLICT DO NOTHING
        """, (
            coupon_id,
            data.get("restaurant_id"),
            data.get("supplier_id")
        ))

        conn.commit()

        return jsonify({"message": "Target added"})

    finally:
        cur.close()
        conn.close()




@admin_coupon_bp.route("/admin/<int:coupon_id>/add-category", methods=["POST"])
@require_admin()
def add_coupon_category(coupon_id):

    data = request.json
    category_id = data.get("category_id")

    if not category_id:
        return jsonify({"error": "category_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO coupon_categories (coupon_id, category_id)
VALUES (%s,%s)
ON CONFLICT DO NOTHING
    """, (coupon_id, category_id))

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"message": "Category added"})
# =========================================================
# 5️⃣ LIST COUPONS (ADMIN)
# =========================================================

@admin_coupon_bp.route("/admin/list", methods=["GET"])
@require_admin()
def list_coupons():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
    SELECT 
        c.coupon_id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_value,
        c.max_discount,

        c.priority,
        c.campaign_id,      -- ✅ NOW WILL SHOW
        c.total_budget,
        c.scope_type,       -- ✅ NOW WILL SHOW

        c.start_date,
        c.end_date,
        c.created_at,       -- ✅ NOW WILL SHOW

        c.is_active,
        c.usage_limit_total,

        COUNT(u.usage_id) AS total_usage,
        COALESCE(SUM(u.discount_amount),0) AS total_discount,
        COALESCE(SUM(u.platform_share),0) AS total_platform_cost,
        COALESCE(SUM(u.supplier_share),0) AS total_supplier_cost,

        COALESCE(ARRAY(
            SELECT supplier_id 
            FROM coupon_targets 
            WHERE coupon_id = c.coupon_id 
            AND supplier_id IS NOT NULL
        ), ARRAY[]::INT[]) AS supplier_ids

    FROM coupons c

    LEFT JOIN coupon_usages u
    ON c.coupon_id = u.coupon_id

    GROUP BY 
        c.coupon_id,
        c.code,
        c.title,
        c.description,
        c.discount_type,
        c.discount_value,
        c.min_order_value,
        c.max_discount,
        c.priority,
        c.campaign_id,
        c.total_budget,
        c.scope_type,
        c.start_date,
        c.end_date,
        c.created_at,
        c.is_active,
        c.usage_limit_total

    ORDER BY c.created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows)


# =========================================================
# 6️⃣ VALIDATE COUPON (Restaurant Side)
# =========================================================

@admin_coupon_bp.route("/validate", methods=["POST"])
def validate_coupon():

    data = request.json
    code = data.get("code", "").strip().upper()

    if not code:
        return jsonify({"valid": False, "error": "Coupon code required"}), 400

    try:
        restaurant_id = int(data.get("restaurant_id"))
        supplier_id = int(data.get("supplier_id"))
    except:
        return jsonify({"valid": False, "error": "Invalid IDs"}), 400

    try:
        subtotal = float(data.get("subtotal", 0))
    except:
        return jsonify({"valid": False, "error": "Invalid subtotal"}), 400

    order_id = data.get("order_id")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        if subtotal <= 0:
            raise Exception("Invalid subtotal")

        conn.autocommit = False

        # ------------------------------------------------
        # LOAD COUPON + RULE ARRAYS
        # ------------------------------------------------

        cur.execute("""
        SELECT
            c.*,


            COALESCE(ARRAY(
                SELECT category_id FROM coupon_categories
                WHERE coupon_id=c.coupon_id
            ), ARRAY[]::INT[]) AS allowed_categories,

            COALESCE(ARRAY(
                SELECT restaurant_id FROM coupon_targets
                WHERE coupon_id=c.coupon_id
                AND restaurant_id IS NOT NULL
            ), ARRAY[]::INT[]) AS target_restaurants,

            COALESCE(ARRAY(
                SELECT supplier_id FROM coupon_targets
                WHERE coupon_id=c.coupon_id
                AND supplier_id IS NOT NULL
            ), ARRAY[]::INT[]) AS target_suppliers

        FROM coupons c
        WHERE c.code=%s
        AND c.is_active=TRUE
        AND c.approval_status='APPROVED'
        AND c.is_deleted=FALSE        
        LIMIT 1
        FOR SHARE
        """, (code,))

        coupon = cur.fetchone()

        if not coupon:
            raise Exception("Invalid coupon")

        now = datetime.now(timezone.utc)

        if not (coupon["start_date"] <= now <= coupon["end_date"]):
            raise Exception("Coupon expired")

        # ------------------------------------------------
        # FLASH COUPON VALIDATION
        # ------------------------------------------------

        if coupon.get("is_flash"):
            if (now - coupon["start_date"]).total_seconds() > 7200:
                raise Exception("Flash coupon expired")

        # ------------------------------------------------
        # RESTAURANT + SUPPLIER VALIDATION
        # ------------------------------------------------

        cur.execute("""
        SELECT
            rr.restaurant_id,
            sr.supplier_id
        FROM restaurant_registration rr
        JOIN supplier_registration sr
        ON sr.supplier_id=%s
        WHERE rr.restaurant_id=%s
        LIMIT 1
        """, (supplier_id, restaurant_id))

        context = cur.fetchone()

        if not context:
            raise Exception("Invalid restaurant or supplier")

                


        # ------------------------------------------------
        # TARGET CHECK
        # ------------------------------------------------

        if coupon["target_restaurants"]:
            if int(restaurant_id) not in list(map(int, coupon["target_restaurants"])):
                raise Exception("Coupon not allowed for this restaurant")

        if coupon["target_suppliers"]:
            if supplier_id not in coupon["target_suppliers"]:
                raise Exception("Coupon not allowed for this supplier")

        # ------------------------------------------------
        # MIN ORDER CHECK
        # ------------------------------------------------

        if subtotal < float(coupon["min_order_value"]):
            raise Exception("Minimum order not met")

        # ------------------------------------------------
        # FIRST ORDER VALIDATION
        # ------------------------------------------------

        if coupon.get("first_order_only"):

            cur.execute("""
            SELECT COUNT(*) AS count
            FROM order_header
            WHERE restaurant_id=%s
            """, (restaurant_id,))

            order_count = cur.fetchone()["count"]

            if order_count > 0:
                raise Exception("Coupon valid only for first order")

        # ------------------------------------------------
        # STACKABLE VALIDATION
        # ------------------------------------------------

        if not coupon.get("stackable") and order_id:

            cur.execute("""
            SELECT coupon_id
            FROM order_financials
            WHERE order_id=%s
            """, (order_id,))

            if cur.fetchone():
                raise Exception("Another coupon already applied")





        # ------------------------------------------------
        # CATEGORY RESTRICTION
        # ------------------------------------------------

        if coupon["allowed_categories"]:

            if not order_id:
                raise Exception("Order required for category coupon")

            cur.execute("""
            SELECT 1
            FROM order_items oi
            JOIN product_management pm
            ON pm.product_id = oi.product_id
            WHERE oi.order_id=%s
            AND pm.category_id = ANY(%s)
            LIMIT 1
            """, (order_id, coupon["allowed_categories"]))

            if not cur.fetchone():
                raise Exception("Coupon not valid for these categories")

        # ------------------------------------------------
        # USAGE STATS
        # ------------------------------------------------

        cur.execute("""
        SELECT
            COUNT(*)::INT AS total_used,
            COUNT(*) FILTER (WHERE restaurant_id=%s)::INT AS used_by_restaurant,
            COALESCE(SUM(discount_amount),0)::NUMERIC AS total_discount
        FROM coupon_usages
        WHERE coupon_id=%s
        """, (restaurant_id, coupon["coupon_id"]))

        stats = cur.fetchone()

        if coupon["usage_limit_total"] and stats["total_used"] >= coupon["usage_limit_total"]:
            raise Exception("Usage limit exceeded")

        if coupon["usage_limit_per_restaurant"] and \
           stats["used_by_restaurant"] >= coupon["usage_limit_per_restaurant"]:
            raise Exception("Coupon already used")

        if coupon["total_budget"] and \
           stats["total_discount"] >= float(coupon["total_budget"]):
            raise Exception("Coupon budget exhausted")

        # ------------------------------------------------
        # DISCOUNT CALCULATION
        # ------------------------------------------------

        discount = calculate_discount(subtotal, coupon)

        platform_part, supplier_part = split_discount(
            discount,
            coupon["absorb_type"],
            float(coupon["supplier_share_percent"])
        )

        conn.commit()

        return jsonify({
            "valid": True,
            "discount": discount,
            "platform_share": platform_part,
            "supplier_share": supplier_part
        })

    except Exception as e:

        conn.rollback()

        return jsonify({
            "valid": False,
            "error": str(e)
        }), 400

    finally:

        cur.close()
        conn.close()

# =========================================================
# 7️⃣ APPLY COUPON (AFTER ORDER CREATED)
# =========================================================

@admin_coupon_bp.route("/apply", methods=["POST"])
def apply_coupon():

    data = request.json

    order_id = int(data["order_id"])
    coupon_id = int(data["coupon_id"])
    restaurant_id = int(data["restaurant_id"])
    supplier_id = int(data["supplier_id"])

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        conn.autocommit = False

        # =====================================================
        # VALIDATE RESTAURANT + SUPPLIER + ORDER
        # =====================================================

        cur.execute("""
        SELECT
            rr.restaurant_id,
            rr.city,
            sr.supplier_id,
            oh.order_id
        FROM restaurant_registration rr
        JOIN supplier_registration sr
        ON sr.supplier_id=%s
        JOIN order_header oh
        ON oh.order_id=%s
        WHERE rr.restaurant_id=%s
        LIMIT 1
        """, (supplier_id, order_id, restaurant_id))

        context = cur.fetchone()

        if not context:
            raise Exception("Invalid restaurant, supplier, or order")

        
        # =====================================================
        # CALCULATE SUBTOTAL
        # =====================================================

        cur.execute("""
        SELECT COALESCE(SUM(quantity * price_per_unit),0) AS subtotal
        FROM order_items
        WHERE order_id=%s
        """, (order_id,))

        subtotal = float(cur.fetchone()["subtotal"])

        if subtotal <= 0:
            raise Exception("Invalid order subtotal")

        # =====================================================
        # LOCK COUPON
        # =====================================================

        cur.execute("""
        SELECT *
        FROM coupons
        WHERE coupon_id=%s
        AND is_active=TRUE
        AND approval_status='APPROVED'
        AND is_deleted=FALSE
        FOR UPDATE
        """, (coupon_id,))

        coupon = cur.fetchone()

        if not coupon:
            raise Exception("Invalid coupon")

        now = datetime.now(timezone.utc)

        if not (coupon["start_date"] <= now <= coupon["end_date"]):
            raise Exception("Coupon expired")

        # =====================================================
        # DUPLICATE PROTECTION
        # =====================================================

        cur.execute("""
        SELECT 1
        FROM coupon_usages
        WHERE order_id=%s
        """, (order_id,))

        if cur.fetchone():
            raise Exception("Coupon already applied")

        # =====================================================
        # STACKABLE CHECK
        # =====================================================

        if not coupon["stackable"]:
            cur.execute("""
            SELECT 1
            FROM order_financials
            WHERE order_id=%s
            """, (order_id,))

            if cur.fetchone():
                raise Exception("Another coupon already applied")



        # =====================================================
        # TARGET VALIDATION
        # =====================================================

        cur.execute("""
        SELECT 1
        FROM coupon_targets
        WHERE coupon_id=%s
        AND (
            restaurant_id=%s
            OR supplier_id=%s
        )
        LIMIT 1
        """, (coupon_id, restaurant_id, supplier_id))

        target_match = cur.fetchone()

        cur.execute("""
        SELECT 1
        FROM coupon_targets
        WHERE coupon_id=%s
        LIMIT 1
        """, (coupon_id,))

        target_exists = cur.fetchone()

        if target_exists and not target_match:
            raise Exception("Coupon not allowed for this restaurant/supplier")



        # =====================================================
        # CATEGORY RESTRICTION
        # =====================================================

        cur.execute("""
        SELECT EXISTS(
            SELECT 1
            FROM coupon_categories
            WHERE coupon_id=%s
        )
        """, (coupon_id,))

        category_exists = cur.fetchone()["exists"]

        if category_exists:

            cur.execute("""
            SELECT 1
            FROM order_items oi
            JOIN product_management pm
            ON pm.product_id = oi.product_id
            WHERE oi.order_id=%s
            AND pm.category_id = ANY(
                SELECT category_id FROM coupon_categories WHERE coupon_id=%s
            )
            LIMIT 1
            """, (order_id, coupon_id))

            if not cur.fetchone():
                raise Exception("Coupon not valid for these categories")

        # =====================================================
        # USAGE LIMITS
        # =====================================================

        cur.execute("""
        SELECT
COUNT(*) AS total_used,
COUNT(*) FILTER (WHERE restaurant_id=%s) AS restaurant_used,
COALESCE(SUM(discount_amount),0) AS total_spent
FROM coupon_usages
WHERE coupon_id=%s
FOR UPDATE
        """, (restaurant_id, coupon_id))

        usage = cur.fetchone()

        if coupon["usage_limit_total"] and \
           usage["total_used"] >= coupon["usage_limit_total"]:
            raise Exception("Usage limit exceeded")

        if coupon["usage_limit_per_restaurant"] and \
           usage["restaurant_used"] >= coupon["usage_limit_per_restaurant"]:
            raise Exception("You already used this coupon")

        # =====================================================
        # COUPON BUDGET
        # =====================================================

        if coupon["total_budget"] and \
           usage["total_spent"] >= float(coupon["total_budget"]):
            raise Exception("Coupon budget exhausted")

        # =====================================================
        # CAMPAIGN BUDGET
        # =====================================================

        if coupon["campaign_id"]:

            cur.execute("""
            SELECT total_budget
            FROM campaigns
            WHERE campaign_id=%s
            """, (coupon["campaign_id"],))

            campaign = cur.fetchone()

            if campaign and campaign["total_budget"]:

                cur.execute("""
                SELECT COALESCE(SUM(discount_amount),0) AS spent
                FROM coupon_usages
                WHERE campaign_id=%s
                """, (coupon["campaign_id"],))

                if cur.fetchone()["spent"] >= float(campaign["total_budget"]):
                    raise Exception("Campaign budget exhausted")

        # =====================================================
        # CALCULATE DISCOUNT
        # =====================================================

        discount = calculate_discount(subtotal, coupon)

        platform_part, supplier_part = split_discount(
            discount,
            coupon["absorb_type"],
            float(coupon["supplier_share_percent"])
        )

        final_total = max(subtotal - discount, 0)

        # =====================================================
        # INSERT USAGE
        # =====================================================

        cur.execute("""
        INSERT INTO coupon_usages
        (coupon_id, restaurant_id, supplier_id,
         order_id, discount_amount,
         platform_share, supplier_share, campaign_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            coupon_id,
            restaurant_id,
            supplier_id,
            order_id,
            discount,
            platform_part,
            supplier_part,
            coupon["campaign_id"]
        ))

        # =====================================================
        # INSERT ORDER FINANCIALS
        # =====================================================

        cur.execute("""
        INSERT INTO order_financials
        (order_id, subtotal, discount_amount,
         final_total, coupon_id, coupon_code,
         absorb_type, platform_discount,
         supplier_discount)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            order_id,
            subtotal,
            discount,
            final_total,
            coupon_id,
            coupon["code"],
            coupon["absorb_type"],
            platform_part,
            supplier_part
        ))

        conn.commit()

        return jsonify({
            "message": "Coupon applied",
            "final_total": final_total,
            "discount": discount
        })

    except Exception as e:

        conn.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        cur.close()
        conn.close()
        
@admin_coupon_bp.route("/admin/auto-deactivate", methods=["POST"])
@require_admin()
def auto_deactivate():

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
    UPDATE coupons
    SET is_active=FALSE
    WHERE is_active=TRUE
    AND end_date < NOW()
    """)

    affected = cur.rowcount

    conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "message": "Expired coupons deactivated",
        "updated": affected
    }) 


# =========================================================
# ACTIVATE COUPON
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>/activate", methods=["PATCH"])
@require_admin()
def activate_coupon(coupon_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE coupons
        SET is_active=TRUE
        WHERE coupon_id=%s
        AND end_date > NOW()
        RETURNING coupon_id
        """, (coupon_id,))

    if not cur.fetchone():
        conn.rollback()
        return jsonify({"error": "Expired coupons cannot be activated"}), 400

    conn.commit()

    log_admin_action(
        admin_id=g.admin["admin_id"],
        action="COUPON_ACTIVATE",
        entity_type="COUPON",
        entity_id=coupon_id,
        ip_address=request.remote_addr
    )

    cur.close()
    conn.close()

    return jsonify({"message": "Coupon activated"}) 

# =========================================================
# REMOVE COUPON RULE
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>/remove-rule", methods=["DELETE"])
@require_admin()
def remove_coupon_rule(coupon_id):

    data = request.json
    rule_type = data.get("type")
    rule_value = data.get("value")

    if not rule_type:
        return jsonify({"error": "rule type required"}), 400
    if not rule_value:
        return jsonify({"error": "rule value required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        if rule_type == "category":

            cur.execute("""
            DELETE FROM coupon_categories
            WHERE coupon_id=%s
            AND category_id=%s
            """, (coupon_id, rule_value))

        elif rule_type == "target_restaurant":

            cur.execute("""
            DELETE FROM coupon_targets
            WHERE coupon_id=%s
            AND restaurant_id=%s
            """, (coupon_id, rule_value))

        elif rule_type == "target_supplier":

            cur.execute("""
            DELETE FROM coupon_targets
            WHERE coupon_id=%s
            AND supplier_id=%s
            """, (coupon_id, rule_value))

        else:
            return jsonify({"error": "Invalid rule type"}), 400

        conn.commit()

        return jsonify({"message": "Rule removed"})

    finally:
        cur.close()
        conn.close()


# =========================================================
# GET COUPON DETAILS
# =========================================================

@admin_coupon_bp.route("/admin/<int:coupon_id>", methods=["GET"])
@require_admin()
def get_coupon_details(coupon_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
        SELECT *
        FROM coupons
        WHERE coupon_id=%s
        """, (coupon_id,))

        coupon = cur.fetchone()

        if not coupon:
            return jsonify({"error": "Coupon not found"}), 404


        cur.execute("""
        SELECT category_id
        FROM coupon_categories
        WHERE coupon_id=%s
        """, (coupon_id,))
        categories = [r["category_id"] for r in cur.fetchall()]

        cur.execute("""
        SELECT restaurant_id, supplier_id
        FROM coupon_targets
        WHERE coupon_id=%s
        """, (coupon_id,))
        targets = cur.fetchall()

        return jsonify({
            "coupon": coupon,
            "categories": categories,
            "targets": targets
        })

    finally:
        cur.close()
        conn.close()

# =========================================================
# SEARCH COUPONS
# =========================================================

@admin_coupon_bp.route("/admin/search", methods=["GET"])
@require_admin()
def search_coupons():

    query = request.args.get("q", "").upper()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
    SELECT *
    FROM coupons
    WHERE code ILIKE %s
    ORDER BY created_at DESC
    LIMIT 50
    """, (f"%{query}%",))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_coupon_bp.route("/admin/categories", methods=["GET"])
@require_admin()
def list_categories():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, name
        FROM category
        WHERE flag='A'
        ORDER BY name
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

# =========================================================
# LIST CAMPAIGNS
# =========================================================

@admin_coupon_bp.route("/admin/campaigns", methods=["GET"])
@require_admin()
def list_campaigns():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
    SELECT
        campaign_id,
        campaign_name AS name,
        total_budget,
        created_at AS start_date,
        NULL AS end_date
    FROM campaigns
    ORDER BY created_at DESC
""")

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_coupon_bp.route("/admin/suppliers", methods=["GET"])
@require_admin()
def list_suppliers():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            u.user_id,
            u.linked_id AS supplier_id,
            COALESCE(sr.company_name_english, 'No Name') AS company_name_english
        FROM users u
        LEFT JOIN supplier_registration sr
        ON sr.supplier_id = u.linked_id
        WHERE LOWER(u.role) = 'supplier'
        AND u.status = 'active'
        AND u.linked_id IS NOT NULL
        ORDER BY sr.company_name_english NULLS LAST
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)