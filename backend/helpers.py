import json
import base64
import re
from psycopg2 import Binary

ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf"
}

def clean_base64(data_str):
    if not data_str:
        return None
    if "," in data_str:
        data_str = data_str.split(",", 1)[1]
    return data_str.replace("\n", "").replace("\r", "").strip()

def build_file_json_from_base64(data_url, filename="upload"):
    if not data_url:
        return None

    if "," in data_url:
        header, content = data_url.split(",", 1)
        mimetype = header.split(";")[0].replace("data:", "")
    else:
        return None

    if mimetype not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported file type")

    return json.dumps({
        "filename": filename,
        "mimetype": mimetype,
        "content": clean_base64(content)
    })