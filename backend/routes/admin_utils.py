from flask import current_app

def admin_authorized(req):
    token = (
        req.headers.get("Authorization", "").replace("Bearer ", "").strip()
        or req.args.get("token", "").strip()
    )

    expected = current_app.config.get("ADMIN_TOKEN", "MAHAL-ADMIN-2025")
    return token == expected

