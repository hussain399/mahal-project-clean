# app.py
import os
from flask import Flask, redirect, send_from_directory
from flask_cors import CORS
from flask_mail import Mail

mail = Mail()

def create_app():
    app = Flask(__name__)

    # =========================
    # CORS FIX (GLOBAL)
    # =========================
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    @app.after_request
    def handle_options(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    # Flask-Mail config
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USE_SSL"] = False
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD", "your-app-password")
    app.config["MAIL_DEFAULT_SENDER"] = (
        "Mahal Team",
        os.getenv("MAIL_USERNAME", "your-email@gmail.com")
    )
    app.config["ADMIN_EMAIL"] = os.getenv("ADMIN_EMAIL")

    # Initialize mail
    mail.init_app(app)



    # ==============================================================
    # IMPORT BLUEPRINTS
    # ==============================================================
    from routes.product_routes import product_bp
    from routes.suppliers_routes import supplier_bp
    from routes.addresses_routes import addresses_bp
    from routes.general_routes import general_bp
    from routes.approval_routes import approval_bp
    # from routes.approval_routes import approval_bp
    from routes.branch_routes import branch_bp
    from routes.store_routes import store_bp
    from routes.offers_routes import bp as offers_bp
    from routes.orders_routes import order_bp, restaurant_bp
    from routes.invoice_routes import invoice_bp
    from routes.gridlist_routes import gridlist_bp
    from routes.change_password_routes import change_bp
    # from routes.login_routes import login_bp
    from routes.receipts_routes import receipts_bp
    from routes.auth_routes import auth_bp
    from routes.restapproval_routes import restapproval_bp
    from routes.profile_setup_routes import profile_master_bp
    from routes.order_issue import order_issue_bp
    from routes.reports import reports_bp
    from routes.receipt import receipt_bp
    from routes.restaurantOrder import restaurant_order_bp
    from routes.inventory_restaurant_routes import restaurant_inventory_bp
    from routes.grn_routes import grn_bp
    from routes.restaurant_invoice import restaurant_invoice_bp
    from routes.menu_items import menu_items_bp
    from routes.recipeMaster import recipe_bp
    from routes.cart_routes import cart_bp
    from routes.payment_routes import payment_bp
    from routes.checkout_routes import checkout_bp
    # from routes.restapproval_routes import restapproval_bp
    # from routes.profile_setup_routes import profile_master_bp
    from routes.profile_change_routes import profile_change_bp
    from routes.admin_profile_change_routes import admin_changes_bp
    from routes.admin_auth_routes import admin_auth_bp
    from routes.admin_dashboard_routes import admin_dashboard_bp
    from routes.admin_audit_routes import admin_audit_bp
    from routes.restaurant_user_mgmt import restaurant_user_mgmt_bp
    from routes.platform_audit import platform_audit_bp
    from routes.supplier_user_mgmt import supplier_user_mgmt_bp
    from routes.supplier_monitor_routes import supplier_monitor_bp
    from routes.restaurant_monitor_routes import restaurant_monitor_bp
    from routes.admin_management_routes import admin_mgmt_bp
    from routes.reviews import reviews_bp
    from routes.search_engine import search_bp

    from routes.order_delivery import order_delivery_bp
    from routes.delivery_boys import delivery_boys_bp
    from routes.wishlist_routes import wishlist_bp
    from routes.admin_coupon import admin_coupon_bp
    from routes.admin_credit import admin_credit_bp
    from routes.admin_coupon import admin_coupon_bp
    from routes.supplier_credit_dashboard import supplier_credit_bp
    from routes.admin_supplier_payments import admin_supplier_bp
    from routes.restaurant_reports_routes import restaurant_reports_bp
    from routes.restaurant_credit import restaurant_credit_bp
    from routes.SupportTickets_routes import support_bp
    from routes.support_admin_bp import support_admin_bp
    from routes.admin_promotions_routes import admin_promotions_bp
    from routes.admin_promotions import admin_promotions
    # ==============================================================
    # REGISTER BLUEPRINTS
    # ==============================================================
    app.register_blueprint(order_delivery_bp)
    app.register_blueprint(delivery_boys_bp)


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
    # app.register_blueprint(login_bp, url_prefix="/api")
    app.register_blueprint(restaurant_bp)
    app.register_blueprint(receipts_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(restapproval_bp)
    app.register_blueprint(profile_master_bp, url_prefix="/api/profile")
    app.register_blueprint(order_issue_bp, url_prefix="/api/v1")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")
    app.register_blueprint(receipt_bp)
    app.register_blueprint(restaurant_order_bp,url_prefix="/api/v1/orders")
    app.register_blueprint(grn_bp, url_prefix="/api/v1")
    app.register_blueprint(restaurant_inventory_bp, url_prefix="/api/inventory")
    app.register_blueprint(restaurant_invoice_bp)
    app.register_blueprint(menu_items_bp)
    app.register_blueprint(recipe_bp)
    app.register_blueprint(cart_bp,url_prefix="/api")
    app.register_blueprint(checkout_bp,url_prefix="/api")
    app.register_blueprint(payment_bp,url_prefix="/api/payment")
    # app.register_blueprint(restapproval_bp)
    # app.register_blueprint(profile_master_bp, url_prefix="/api/profile")
    app.register_blueprint(profile_change_bp)
    # app.register_blueprint(admin_changes_bp)
    # app.register_blueprint(profile_change_bp)
    app.register_blueprint(admin_changes_bp)
    app.register_blueprint(admin_auth_bp)
    app.register_blueprint(admin_coupon_bp)
    app.register_blueprint(admin_dashboard_bp)
    app.register_blueprint(admin_audit_bp)
    app.register_blueprint(supplier_monitor_bp)
    app.register_blueprint(restaurant_monitor_bp)
    app.register_blueprint(admin_mgmt_bp)
    app.register_blueprint(restaurant_user_mgmt_bp)
    app.register_blueprint(supplier_user_mgmt_bp)
    app.register_blueprint(platform_audit_bp)
    app.register_blueprint(reviews_bp, url_prefix="/api")
    # app.register_blueprint(approval_bp, url_prefix="/api/v1/admin")
    app.register_blueprint(search_bp,url_prefix="/api")
    app.register_blueprint(wishlist_bp, url_prefix="/api")
    app.register_blueprint(admin_credit_bp)
    app.register_blueprint(supplier_credit_bp)
    app.register_blueprint(admin_supplier_bp)
    app.register_blueprint( restaurant_reports_bp,url_prefix="/api/v1")
    app.register_blueprint(restaurant_credit_bp)
    app.register_blueprint(support_bp)
    app.register_blueprint(support_admin_bp)
    app.register_blueprint(admin_promotions_bp)
    app.register_blueprint(admin_promotions, url_prefix="/api/v1")
    # 
    # ==============================================================
    # ROOT REDIRECT TO FRONTEND
    # ==============================================================
    @app.route("/")
    def home():
        return redirect(os.getenv("FRONTEND_URL", "http://localhost:3000"), code=302)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_DEBUG", "1") == "1"
    )