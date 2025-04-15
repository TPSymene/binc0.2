import sqlite3
from pathlib import Path

def check_orphaned_tokens(db_path):
    """Check for orphaned tokens in the database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM authtoken_token
        WHERE user_id NOT IN (SELECT id FROM auth_user);
    """)
    orphaned_tokens = cursor.fetchall()

    if orphaned_tokens:
        print("Orphaned tokens found:")
        for token in orphaned_tokens:
            print(token)
    else:
        print("No orphaned tokens found.")

    conn.close()

if __name__ == "__main__":
    db_path = Path("db.sqlite3")
    check_orphaned_tokens(db_path)
