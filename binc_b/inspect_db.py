import sqlite3
from pathlib import Path

# Path to your SQLite database
db_path = Path("db.sqlite3")

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Enable foreign key constraints
cursor.execute("PRAGMA foreign_keys = ON;")

# Check the schema of the authtoken_token table
cursor.execute("PRAGMA table_info(authtoken_token);")
columns = cursor.fetchall()
print("Columns in authtoken_token table:")
for column in columns:
    print(column)

# Check foreign key constraints
cursor.execute("PRAGMA foreign_key_list(authtoken_token);")
foreign_keys = cursor.fetchall()
print("\nForeign key constraints in authtoken_token table:")
for fk in foreign_keys:
    print(fk)

# Close the connection
conn.close()
