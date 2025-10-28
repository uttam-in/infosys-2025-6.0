"""
Migration script to add quiz tracking columns to existing database
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "auth.db"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(quiz_attempts)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add quiz_data column if it doesn't exist
        if 'quiz_data' not in columns:
            print("Adding quiz_data column...")
            cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN quiz_data TEXT")
            print("✓ quiz_data column added")
        else:
            print("✓ quiz_data column already exists")
        
        # Add user_answers column if it doesn't exist
        if 'user_answers' not in columns:
            print("Adding user_answers column...")
            cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN user_answers TEXT")
            print("✓ user_answers column added")
        else:
            print("✓ user_answers column already exists")
        
        # Update existing records to have default values
        cursor.execute("UPDATE quiz_attempts SET score = 0 WHERE score IS NULL")
        cursor.execute("UPDATE quiz_attempts SET percentage = 0 WHERE percentage IS NULL")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")
        
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
