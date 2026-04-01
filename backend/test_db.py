from db import get_db_connection

try:
    conn = get_db_connection(use_azure=True)  # ⚠️ Use Azure DB
    cur = conn.cursor()
    cur.execute("SELECT NOW();")
    print("✅ Connected successfully to Azure!", cur.fetchone())
    cur.close()
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
