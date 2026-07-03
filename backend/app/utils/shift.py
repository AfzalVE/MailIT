# from pynput import keyboard
# from pynput.keyboard import Key, Controller
# import threading
# import time
# import traceback

# controller = Controller()
# stop_event = threading.Event()


# def press_shift_periodically(interval=10):
#     while not stop_event.is_set():
#         try:
#             controller.press(Key.shift)
#             controller.release(Key.shift)
            
#         except Exception as e:
#             print(f"Error pressing shift: {e}")
#             traceback.print_exc()
        
#         if stop_event.wait(interval):
#             break


# def on_press(key):
#     try:
#         if key == Key.esc:
#             print("Esc pressed. Exiting...")
#             stop_event.set()
#             return False
#     except AttributeError as e:
#         print(f"AttributeError in on_press: {e}")
#     except Exception as e:
#         print(f"Unexpected error in on_press: {e}")
#         traceback.print_exc()


# def on_release(key):
#     try:
#         pass
#     except Exception as e:
#         print(f"Error in on_release: {e}")


# if __name__ == "__main__":
#     print("Starting virtual Shift presser. Press Esc to stop.")
#     thread = threading.Thread(target=press_shift_periodically, daemon=True)
#     thread.start()

#     try:
#         with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
#             listener.join()
#     except Exception as e:
#         print(f"Keyboard listener error: {e}")
#         traceback.print_exc()
#     finally:
#         stop_event.set()
#         thread.join()
#         print("Stopped.")



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