import sqlite3

DB_FILE = 'users.db'

def ensure_table():
    """Ensure the users table exists with correct columns."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

def register_user(name, email, password):
    """
    Register a new user.
    Returns (True, message) if success, (False, message) if failure.
    """
    ensure_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    try:
        cursor.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, email, password)
        )
        conn.commit()
        return True, "User registered successfully."
    except sqlite3.IntegrityError:
        return False, "Email already exists."
    finally:
        conn.close()

def check_login(email, password):
    """
    Check login credentials.
    Returns (True, message) if login successful, (False, message) if failed.
    """
    ensure_table()
    conn = sqlite3.connect(DB_FILE, check_same_thread=False, timeout=10)
    cursor = conn.cursor()
    cursor.execute(
        'SELECT id, name, email, password FROM users WHERE email = ?',
        (email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user:
        return False, "User does not exist. Please sign up first."
    
    user_id, name, email, db_password = user
    if db_password == password:
        return True, "Login successful."
    else:
        return False, "Incorrect password."
