import os
import sqlite3

db_path = "users.db"
print(f"Looking for DB at: {os.path.abspath(db_path)}")

if not os.path.exists(db_path):
    print("❌ Database file not found!")
else:
    print("✅ Database file found!")
    conn = sqlite3.connect(db_path, check_same_thread=False, timeout=10)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print(f"Tables found: {tables}")

    if ('users',) not in tables:
        print("❌ 'users' table not found.")
    else:
        c.execute("SELECT * FROM users")
        rows = c.fetchall()
        print(f"Rows in 'users' table: {len(rows)}")
        for row in rows:
            print(row)

    conn.close()
