# app.py
import os

from flask import Flask, request
from flask_cors import CORS
from flask_mail import Mail
from flasgger import Swagger


mail = Mail()


def _host_to_origin(value: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        return ""
    if trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed.rstrip("/")
    return f"https://{trimmed.rstrip('/')}"


def _split_origins(value: str) -> list[str]:
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


def init_swagger(app):
    app.config["SWAGGER"] = {
        "title": "Mahal API",
        "uiversion": 3,
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec_1",
                "route": "/api/docs/apispec_1.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs",
    }

    Swagger(app, config=swagger_config)


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # ================= ENV URL CONFIG =================
    # URL_PREFIX is the single canonical backend host/origin setting.
    # API_URL is kept only as a backward-compatible fallback.
    app.config["URL_PREFIX"] = os.getenv(
        "URL_PREFIX",
        os.getenv("API_URL", "mahal-backend.azurewebsites.net"),
    )

    # ================= MAIL CONFIG =================
    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "587"))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "1") == "1"
    app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "0") == "1"
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = ("Mahal Team", os.getenv("MAIL_USERNAME"))
    app.config["ADMIN_EMAIL"] = os.getenv("ADMIN_EMAIL")

    mail.init_app(app)
    init_swagger(app)

    # ================= IMPORT BLUEPRINTS =================
    from backend.routes.product_routes import product_bp
    from backend.routes.suppliers_routes import supplier_bp
    from backend.routes.addresses_routes import addresses_bp
    from backend.routes.general_routes import general_bp
    from backend.routes.approval_routes import approval_bp
    from backend.routes.branch_routes import branch_bp
    from backend.routes.store_routes import store_bp
    from backend.routes.offers_routes import bp as offers_bp
    from backend.routes.orders_routes import order_bp, restaurant_bp
    from backend.routes.invoice_routes import invoice_bp
    from backend.routes.gridlist_routes import gridlist_bp
    from backend.routes.change_password_routes import change_bp
    from backend.routes.receipts_routes import receipts_bp
    from backend.routes.auth_routes import auth_bp
    from backend.routes.restapproval_routes import restapproval_bp
    from backend.routes.profile_setup_routes import profile_master_bp
    from backend.routes.order_issue import order_issue_bp
    from backend.routes.reports import reports_bp
    from backend.routes.receipt import receipt_bp
    from backend.routes.restaurantOrder import restaurant_order_bp
    from backend.routes.inventory_restaurant_routes import restaurant_inventory_bp
    from backend.routes.grn_routes import grn_bp
    from backend.routes.restaurant_invoice import restaurant_invoice_bp
    from backend.routes.menu_items import menu_items_bp
    from backend.routes.recipeMaster import recipe_bp
    from backend.routes.cart_routes import cart_bp
    from backend.routes.payment_routes import payment_bp
    from backend.routes.checkout_routes import checkout_bp
    from backend.routes.profile_change_routes import profile_change_bp
    from backend.routes.admin_profile_change_routes import admin_changes_bp
    from backend.routes.admin_auth_routes import admin_auth_bp
    from backend.routes.admin_dashboard_routes import admin_dashboard_bp
    from backend.routes.admin_audit_routes import admin_audit_bp
    from backend.routes.restaurant_user_mgmt import restaurant_user_mgmt_bp
    from backend.routes.platform_audit import platform_audit_bp
    from backend.routes.supplier_user_mgmt import supplier_user_mgmt_bp
    from backend.routes.supplier_monitor_routes import supplier_monitor_bp
    from backend.routes.restaurant_monitor_routes import restaurant_monitor_bp
    from backend.routes.admin_management_routes import admin_mgmt_bp
    from backend.routes.reviews import reviews_bp
    from backend.routes.search_engine import search_bp
    from backend.routes.restaurant_reports_routes import restaurant_reports_bp
    from backend.routes.delivery_boys import delivery_boys_bp
    from backend.routes.wishlist_routes import wishlist_bp
    from backend.routes.location_routes import location_bp
    from backend.routes.category_routes import category_bp

    # ================= REGISTER BLUEPRINTS =================
    app.register_blueprint(product_bp, url_prefix="/api/products")
    app.register_blueprint(supplier_bp, url_prefix="/api/suppliers")
    app.register_blueprint(addresses_bp, url_prefix="/api")
    app.register_blueprint(general_bp, url_prefix="/api/v1")
    app.register_blueprint(approval_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(branch_bp, url_prefix="/api")
    app.register_blueprint(store_bp, url_prefix="/api")
    app.register_blueprint(offers_bp, url_prefix="/api")
    app.register_blueprint(order_bp, url_prefix="/api/v1/orders")
    app.register_blueprint(invoice_bp, url_prefix="/api/v1/invoice")
    app.register_blueprint(gridlist_bp, url_prefix="/api")
    app.register_blueprint(change_bp, url_prefix="/api")
    app.register_blueprint(restaurant_bp)
    app.register_blueprint(receipts_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(restapproval_bp)
    app.register_blueprint(profile_master_bp, url_prefix="/api/profile")
    app.register_blueprint(order_issue_bp, url_prefix="/api/v1")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(receipt_bp)
    app.register_blueprint(restaurant_order_bp, url_prefix="/api/v1/orders")
    app.register_blueprint(grn_bp, url_prefix="/api/v1")
    app.register_blueprint(restaurant_inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(restaurant_invoice_bp)
    app.register_blueprint(menu_items_bp)
    app.register_blueprint(recipe_bp)
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(checkout_bp, url_prefix="/api")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(profile_change_bp)
    app.register_blueprint(admin_changes_bp)
    app.register_blueprint(admin_auth_bp)
    app.register_blueprint(admin_dashboard_bp)
    app.register_blueprint(admin_audit_bp)
    app.register_blueprint(supplier_monitor_bp)
    app.register_blueprint(restaurant_monitor_bp)
    app.register_blueprint(admin_mgmt_bp)
    app.register_blueprint(restaurant_user_mgmt_bp)
    app.register_blueprint(supplier_user_mgmt_bp)
    app.register_blueprint(platform_audit_bp)
    app.register_blueprint(reviews_bp, url_prefix="/api")
    app.register_blueprint(search_bp, url_prefix="/api")
    app.register_blueprint(restaurant_reports_bp, url_prefix="/api/v1")
    app.register_blueprint(delivery_boys_bp)
    app.register_blueprint(wishlist_bp, url_prefix="/api")
    app.register_blueprint(location_bp)
    app.register_blueprint(category_bp, url_prefix="/api/category")

    # ================= ROOT HEALTH CHECK =================
    @app.route("/")
    def home():
        return "MahalCloud Server is Online", 200

    @app.route("/api/debug/ping", methods=["GET", "OPTIONS"])
    def ping():
        return {"status": "ok", "url_prefix": app.config["URL_PREFIX"]}, 200

    # ================= CORS CONFIG =================
    cors_allow_all = os.getenv("CORS_ALLOW_ALL", "1") == "1"
    default_origins = [_host_to_origin(app.config["URL_PREFIX"])]
    frontend_origins = _split_origins(
        os.getenv("FRONTEND_URL", ",".join(origin for origin in default_origins if origin))
    )

    CORS(
        app,
        resources={r"/api/*": {"origins": "*" if cors_allow_all else frontend_origins}},
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        supports_credentials=False if cors_allow_all else True,
        send_wildcard=cors_allow_all,
        max_age=86400,
    )

    @app.before_request
    def request_started_log():
        print("➡️ Request started")
        return None

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            return "", 200
        return None

    @app.before_request
    def trace_request_lifecycle():
        if os.getenv("CORS_TRACE", "0") != "1":
            return None
        app.logger.info(
            "[CORS-TRACE] incoming method=%s path=%s origin=%s acrm=%s",
            request.method,
            request.path,
            request.headers.get("Origin"),
            request.headers.get("Access-Control-Request-Method"),
        )
        return None

    @app.after_request
    def trace_response_lifecycle(response):
        if os.getenv("CORS_TRACE", "0") == "1":
            app.logger.info(
                "[CORS-TRACE] outgoing method=%s path=%s status=%s a-c-a-o=%s a-c-a-m=%s",
                request.method,
                request.path,
                response.status_code,
                response.headers.get("Access-Control-Allow-Origin"),
                response.headers.get("Access-Control-Allow-Methods"),
            )

        if (
            os.getenv("AUTH_DEBUG", "1") == "1"
            and request.path in {
                "/api/auth/send-otp",
                "/api/auth/verify-otp",
                "/api/admin/auth/send-otp",
                "/api/admin/auth/verify-otp",
            }
        ):
            app.logger.info(
                "[AUTH-DEBUG] method=%s path=%s status=%s origin=%s remote=%s",
                request.method,
                request.path,
                response.status_code,
                request.headers.get("Origin"),
                request.remote_addr,
            )
        return response

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "1") == "1",
    )
