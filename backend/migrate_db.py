"""
Database migration script to add quiz_attempts table to existing databases.
Run this if you have an existing auth.db without the quiz_attempts table.
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "auth.db"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if quiz_attempts table exists
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='quiz_attempts'
    """)
    
    if cursor.fetchone():
        print("✓ quiz_attempts table already exists. No migration needed.")
        conn.close()
        return
    
    # Create quiz_attempts table
    print("Creating quiz_attempts table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            score INTEGER NOT NULL,
            percentage REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()
    
    print("✓ Migration completed successfully!")
    print("✓ quiz_attempts table created.")

if __name__ == "__main__":
    migrate()
