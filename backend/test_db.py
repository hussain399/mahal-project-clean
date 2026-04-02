from backend.db import get_db_connection

try:
    conn = get_db_connection()  # ⚠️ Use Azure DB
    cur = conn.cursor()
    cur.execute("SELECT NOW();")
    print("✅ Connected successfully to Azure!", cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
