import jwt
from datetime import datetime, timedelta

SECRET = "SUPER_SECRET_DRIVER_KEY_CHANGE"


def generate_driver_token(order_id, supplier_id):

    expiry = datetime.utcnow() + timedelta(hours=12)

    payload = {
        "order_id": order_id,
        "supplier_id": supplier_id,
        "role": "DRIVER",
        "exp": expiry
    }

    token = jwt.encode(payload, SECRET, algorithm="HS256")

    return token, expiry


def verify_driver_token(token):

    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        return data
    except Exception:
        return None