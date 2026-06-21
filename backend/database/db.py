import libsql_experimental as libsql
import os
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
_connection = None


def _parse_turso_url(url):
    """Parse Turso DATABASE_URL into sync_url and auth_token"""
    parsed = urlparse(url)
    # Extract auth token from query parameter
    qs = parse_qs(parsed.query)
    auth_token = qs.get("authToken", [""])[0]
    # Build the sync_url (https:// version for remote connection)
    sync_url = f"libsql://{parsed.hostname}"
    return sync_url, auth_token


def get_db():
    """Get database connection (synchronous)"""
    global _connection
    if _connection is None:
        sync_url, auth_token = _parse_turso_url(DATABASE_URL)
        _connection = libsql.connect(
            database="tasktrack.db",
            sync_url=sync_url,
            auth_token=auth_token,
        )
        _connection.sync()
    return _connection


def execute_query(sql, params=None):
    """Execute a query and return the cursor result"""
    conn = get_db()
    if params:
        cursor = conn.execute(sql, tuple(params))
    else:
        cursor = conn.execute(sql)
    conn.commit()
    return cursor


def fetch_one(sql, params=None):
    """Execute a query and return a single row"""
    cursor = execute_query(sql, params)
    return cursor.fetchone()


def fetch_all(sql, params=None):
    """Execute a query and return all rows"""
    cursor = execute_query(sql, params)
    return cursor.fetchall()


def init_db():
    """Initialize database schema"""
    try:
        execute_query("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        execute_query("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                subject TEXT NOT NULL,
                deadline TEXT,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                user_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        execute_query("""
            CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
        """)

        execute_query("""
            CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject)
        """)

        # Sync changes to Turso cloud
        conn = get_db()
        conn.sync()

        print("✓ Database initialized successfully!")
    except Exception as e:
        print(f"⚠ Database init error: {e}")
