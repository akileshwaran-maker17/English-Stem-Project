import language_tool_python
import subprocess
import webbrowser
import sys
import time

# Initialize grammar tool
tool = language_tool_python.LanguageTool('en-US')

print("\n==============================")
print("   ENGLISH GRAMMAR ASSISTANT")
print("==============================")
print("1. CLI Mode (Keyboard Input)")
print("2. Web App Mode (Frontend UI)")
print("==============================")

choice = input("Enter your choice (1/2): ").strip()

if choice == '1':
    print("\n--- CLI MODE ---")
    text = input("Enter a sentence: ").strip()

    if text:
        matches = tool.check(text)
        corrected_text = language_tool_python.utils.correct(text, matches)

        print("\n------------------------------")
        print("Original Sentence : ", text)
        print("Corrected Sentence: ", corrected_text)
        print("Issues Found      : ", len(matches))
        print("------------------------------")
    else:
        print("No input provided.")

elif choice == '2':
    print("\nStarting Web Application...")
    print("Opening browser at http://127.0.0.1:5000")

    subprocess.Popen([sys.executable, 'app.py'])
    time.sleep(2)
    webbrowser.open('http://127.0.0.1:5000')

else:
    print("Invalid choice. Please run again and choose 1 or 2.")