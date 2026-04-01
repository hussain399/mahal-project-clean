from flask import Blueprint, jsonify, g, request
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action
from datetime import datetime, timedelta

# OPTIONAL: socket emit safe import


admin_dashboard_bp = Blueprint(
    "admin_dashboard_bp", __name__, url_prefix="/api/v1/admin"
)

@admin_dashboard_bp.route("/dashboard-metrics", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def admin_dashboard_metrics():
    conn = cur = None

    log_admin_action(
        admin_id=g.admin["admin_id"],
        action="READ_ACCESS",
        entity_type="dashboard_metrics",
        ip_address=request.remote_addr
    )

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ================= RANGE FILTER =================
        range_type = request.args.get("range", "7d")

        if range_type == "today":
            date_filter = "DATE(order_date) = CURRENT_DATE"
        elif range_type == "month":
            date_filter = "DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE)"
        else:
            date_filter = "order_date >= CURRENT_DATE - INTERVAL '7 days'"

        perms = set(g.admin.get("permissions", []))

        response = {
            "permissions": list(perms),
            "kpis": {},
            "order_trend": [],
            "revenue_trend": [],
            "order_status_distribution": [],
            "top_suppliers": [],
            "alerts": {},
            "recent_activity": [],
            "extra": {}
        }

        # ======================================================
        # 🧠 KPI SECTION
        # ======================================================

        cur.execute(f"SELECT COUNT(*) FROM order_header WHERE {date_filter}")
        today_orders = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) FROM order_header WHERE status IN ('PLACED','ACCEPTED','PACKED')")
        pending_orders = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) FROM order_header WHERE status IN ('FAILED','CANCELLED')")
        failed_orders = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) FROM order_header")
        total_orders = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) FROM order_header WHERE status='DELIVERED'")
        delivered_orders = cur.fetchone()["count"]

        # USERS
        cur.execute("SELECT COUNT(*) FROM users WHERE role='supplier' AND status='active'")
        active_suppliers = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) FROM users WHERE role='restaurant' AND status='active'")
        active_restaurants = cur.fetchone()["count"]

        # REVENUE
        cur.execute(f"""
            SELECT COALESCE(SUM(total_amount),0)
            FROM order_header
            WHERE {date_filter}
        """)
        today_revenue = float(cur.fetchone()["coalesce"])

        cur.execute("""
            SELECT COALESCE(SUM(total_amount),0)
            FROM order_header
            WHERE DATE_TRUNC('month', order_date)=DATE_TRUNC('month', CURRENT_DATE)
        """)
        monthly_revenue = float(cur.fetchone()["coalesce"])

        # ======================================================
        # 💰 CREDIT
        # ======================================================

        cur.execute("""
            SELECT COALESCE(SUM(amount),0)
            FROM restaurant_credit_transactions
            WHERE type='DEBIT'
        """)
        credit_given = float(cur.fetchone()["coalesce"])

        cur.execute("""
            SELECT COALESCE(SUM(amount),0)
            FROM restaurant_credit_settlements
        """)
        credit_collected = float(cur.fetchone()["coalesce"])

        cur.execute("""
            SELECT COALESCE(SUM(restaurant_due_amount),0)
            FROM order_header
            WHERE restaurant_payment_status != 'PAID'
        """)
        outstanding_credit = float(cur.fetchone()["coalesce"])

        cur.execute("""
            SELECT COALESCE(SUM(restaurant_due_amount),0)
            FROM order_header
            WHERE credit_due_date IS NOT NULL
            AND credit_due_date < CURRENT_DATE
            AND restaurant_payment_status != 'PAID'
        """)
        overdue_credit = float(cur.fetchone()["coalesce"])

        cur.execute("""
            SELECT COUNT(*)
            FROM restaurant_registration
            WHERE credit_used > credit_limit
        """)
        credit_risk_restaurants = cur.fetchone()["count"]

        cur.execute("""
            SELECT COALESCE(SUM(amount),0)
            FROM supplier_payments
        """)
        supplier_payouts = float(cur.fetchone()["coalesce"])

        # SUPPORT
        cur.execute("""
            SELECT COUNT(*) FROM support_tickets
            WHERE status IN ('open','in_progress')
        """)
        open_tickets = cur.fetchone()["count"]

        # HEALTH
        avg_order_value = (monthly_revenue / total_orders) if total_orders else 0
        success_rate = (delivered_orders / total_orders * 100) if total_orders else 0
        cancellation_rate = (failed_orders / total_orders * 100) if total_orders else 0

        response["kpis"] = {
            "today_orders": today_orders,
            "pending_orders": pending_orders,
            "failed_orders": failed_orders,
            "active_suppliers": active_suppliers,
            "active_restaurants": active_restaurants,
            "today_revenue": today_revenue,
            "monthly_revenue": monthly_revenue,
            "open_tickets": open_tickets,
            "credit_given": credit_given,
            "credit_collected": credit_collected,
            "outstanding_credit": outstanding_credit,
            "overdue_credit": overdue_credit,
            "credit_risk_restaurants": credit_risk_restaurants,
            "supplier_payouts": supplier_payouts,
            "avg_order_value": round(avg_order_value, 2),
            "success_rate": round(success_rate, 2),
            "cancellation_rate": round(cancellation_rate, 2)
        }

        # ======================================================
        # 📊 ORDER TREND
        # ======================================================

        days = [(datetime.now() - timedelta(days=i)).date() for i in range(6, -1, -1)]
        trend_map = {str(d): 0 for d in days}

        cur.execute(f"""
            SELECT DATE(order_date) as day, COUNT(*) as total
            FROM order_header
            WHERE {date_filter}
            GROUP BY day
        """)

        for row in cur.fetchall():
            trend_map[str(row["day"])] = row["total"]

        response["order_trend"] = [
            {"day": d.strftime("%d %b"), "total": trend_map[str(d)]}
            for d in days
        ]

        # ======================================================
        # 📊 REVENUE TREND
        # ======================================================

        revenue_map = {str(d): 0 for d in days}

        cur.execute(f"""
            SELECT DATE(order_date) as day, SUM(total_amount) as total
            FROM order_header
            WHERE {date_filter}
            GROUP BY day
        """)

        for row in cur.fetchall():
            revenue_map[str(row["day"])] = float(row["total"] or 0)

        response["revenue_trend"] = [
            {"day": d.strftime("%d %b"), "total": revenue_map[str(d)]}
            for d in days
        ]

        # ======================================================
        # 📊 ORDER STATUS (SAFE)
        # ======================================================
        cur.execute("""
            SELECT 
            CASE
                WHEN status IN ('PLACED','ACCEPTED','PACKED') THEN 'Pending'
                WHEN status='DELIVERED' THEN 'Completed'
                ELSE 'Failed'
            END as status,
            COUNT(*) as total
            FROM order_header
            WHERE status IS NOT NULL
            GROUP BY status
        """)
        response["order_status_distribution"] = cur.fetchall()

        # ======================================================
        # 📊 TOP SUPPLIERS
        # ======================================================
        cur.execute("""
            SELECT supplier_id, COUNT(*) as total_orders
            FROM order_header
            GROUP BY supplier_id
            ORDER BY total_orders DESC
            LIMIT 5
        """)
        response["top_suppliers"] = cur.fetchall()

        # ======================================================
        # 🚨 ALERTS
        # ======================================================

        cur.execute("""
            SELECT COUNT(*) FROM order_header
            WHERE status='PLACED'
            AND order_date < NOW() - INTERVAL '2 hours'
        """)
        stuck_orders = cur.fetchone()["count"]

        cur.execute("""
            SELECT COUNT(*) FROM order_header
            WHERE payment_status='FAILED'
        """)
        failed_payments = cur.fetchone()["count"]

        cur.execute("""
            SELECT COUNT(*) FROM supplier_registration
            WHERE approval_status='Pending'
        """)
        pending_suppliers = cur.fetchone()["count"]

        cur.execute("""
            SELECT COUNT(*) FROM support_tickets
            WHERE priority='high' AND status!='closed'
        """)
        high_priority_tickets = cur.fetchone()["count"]

        # SLA BREACH
        cur.execute("""
            SELECT COUNT(*) FROM support_tickets
            WHERE sla_due_at < NOW()
            AND status NOT IN ('resolved','closed')
        """)
        sla_breach = cur.fetchone()["count"]

        response["alerts"] = {
            "stuck_orders": stuck_orders,
            "failed_payments": failed_payments,
            "pending_suppliers": pending_suppliers,
            "high_priority_tickets": high_priority_tickets,
            "overdue_credit": overdue_credit,
            "credit_risk_restaurants": credit_risk_restaurants,
            "sla_breach": sla_breach
        }

        # ======================================================
        # 🧠 EXTRA INSIGHTS
        # ======================================================

        # INACTIVE SUPPLIERS (>7 days no orders)
        cur.execute("""
            SELECT COUNT(*) FROM users u
            WHERE role='supplier'
            AND NOT EXISTS (
                SELECT 1 FROM order_header o
                WHERE o.supplier_id = u.user_id
                AND o.order_date >= CURRENT_DATE - INTERVAL '7 days'
            )
        """)
        inactive_suppliers = cur.fetchone()["count"]

        response["extra"] = {
            "inactive_suppliers": inactive_suppliers
        }

        # ======================================================
        # 📈 ACTIVITY
        # ======================================================
        cur.execute("""
            SELECT order_id, status, order_date
            FROM order_header
            ORDER BY order_date DESC
            LIMIT 10
        """)
        response["recent_activity"] = cur.fetchall()

        # ======================================================
        # 🟢 LEGACY
        # ======================================================
        if "APPROVE_SUPPLIERS" in perms or "APPROVE_RESTAURANTS" in perms:

            cur.execute("SELECT COUNT(*) FROM supplier_registration")
            suppliers = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM restaurant_registration")
            restaurants = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM supplier_registration WHERE approval_status='Pending'")
            pending_suppliers = cur.fetchone()["count"]

            cur.execute("SELECT COUNT(*) FROM restaurant_registration WHERE approval_status='Pending'")
            pending_restaurants = cur.fetchone()["count"]

            cur.execute("""
                SELECT COUNT(*) FROM supplier_registration
                WHERE approval_status='Approved'
                AND DATE(updated_at)=CURRENT_DATE
            """)
            approved_suppliers_today = cur.fetchone()["count"]

            cur.execute("""
                SELECT COUNT(*) FROM restaurant_registration
                WHERE approval_status='Approved'
                AND DATE(updated_at)=CURRENT_DATE
            """)
            approved_restaurants_today = cur.fetchone()["count"]

            response["legacy"] = {
                "suppliers": suppliers,
                "restaurants": restaurants,
                "pendingApprovals": pending_suppliers + pending_restaurants,
                "approvedToday": approved_suppliers_today + approved_restaurants_today
            }



        return jsonify(response), 200

    except Exception as e:
        print("❌ admin dashboard error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()