from pynput import keyboard
from pynput.keyboard import Key, Controller
import threading
import time
import traceback

controller = Controller()
stop_event = threading.Event()


def press_shift_periodically(interval=10):
    while not stop_event.is_set():
        try:
            controller.press(Key.shift)
            controller.release(Key.shift)
            
        except Exception as e:
            print(f"Error pressing shift: {e}")
            traceback.print_exc()
        
        if stop_event.wait(interval):
            break


def on_press(key):
    try:
        if key == Key.esc:
            print("Esc pressed. Exiting...")
            stop_event.set()
            return False
    except AttributeError as e:
        print(f"AttributeError in on_press: {e}")
    except Exception as e:
        print(f"Unexpected error in on_press: {e}")
        traceback.print_exc()


def on_release(key):
    try:
        pass
    except Exception as e:
        print(f"Error in on_release: {e}")


if __name__ == "__main__":
    print("Starting virtual Shift presser. Press Esc to stop.")
    thread = threading.Thread(target=press_shift_periodically, daemon=True)
    thread.start()

    try:
        with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
            listener.join()
    except Exception as e:
        print(f"Keyboard listener error: {e}")
        traceback.print_exc()
    finally:
        stop_event.set()
        thread.join()
        print("Stopped.")
