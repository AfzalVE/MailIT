


# 1. FIXED: Changed 'postgresql+psycopg://' to 'postgresql://' 
# 2. FIXED: Ensured '?sslmode=require' is fully spelled out
DATABASE_URL = "postgresql://neondb_owner:npg_wgxYMB8psS4E@ep-odd-heart-addo8465-pooler.c-2.us-east-1.aws.neon.tech/replyiq?sslmode=require"

# FIXED: Define conn as None upfront so the finally block doesn't crash if connection fails

import psycopg2
from psycopg2 import sql
conn = None
try:
    print("Connecting to Neon database...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Fetch all table names from the public schema
    cursor.execute("""
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public';
    """)
    tables = cursor.fetchall()

    if not tables:
        print("No tables found to delete.")
    else:
        print(f"Found {len(tables)} tables. Deleting...")
        
        for table in tables:
            table_name = table[0]
            query = sql.SQL("DROP TABLE IF EXISTS {} CASCADE;").format(sql.Identifier(table_name))
            cursor.execute(query)
            print(f"Dropped table: {table_name}")
            
        print("Successfully deleted all tables!")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    if conn is not None:
        cursor.close()
        conn.close()
        print("Database connection closed.")