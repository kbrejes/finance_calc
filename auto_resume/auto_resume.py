import pyautogui
import time
import sys
import os

def main():
    print("🤖 Antigravity Auto-Resumer Starting...")
    print("Make sure you have taken small screenshots of the buttons and saved them as:")
    print("  - retry_btn.png")
    print("  - continue_btn.png\n")
    print("Monitoring screen... Press Ctrl+C to stop.\n")
    
    try:
        while True:
            # --- Check for the 'Retry' button ---
            if os.path.exists('retry_btn.png'):
                try:
                    retry_pos = pyautogui.locateCenterOnScreen('retry_btn.png', confidence=0.8)
                    if retry_pos:
                        print(f"[{time.strftime('%X')}] ⚠️ 'Agent terminated' detected. Clicking 'Retry'...")
                        pyautogui.click(retry_pos)
                        pyautogui.moveRel(0, -50) 
                        time.sleep(5) 
                        continue
                except pyautogui.ImageNotFoundException:
                    pass
                except Exception as e:
                    pass

            # --- Check for the 'Continue' button ---
            if os.path.exists('continue_btn.png'):
                try:
                    continue_pos = pyautogui.locateCenterOnScreen('continue_btn.png', confidence=0.8)
                    if continue_pos:
                        print(f"[{time.strftime('%X')}] ⚠️ 'Server overload' detected. Clicking 'Continue'...")
                        pyautogui.click(continue_pos)
                        pyautogui.moveRel(0, -50)
                        time.sleep(5)
                except pyautogui.ImageNotFoundException:
                    pass
                except Exception as e:
                    pass

            time.sleep(2) # Scan the screen every 2 seconds
            
    except KeyboardInterrupt:
        print("\nStopping Auto-Resumer.")
        sys.exit(0)

if __name__ == "__main__":
    main()
