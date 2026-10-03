import sys
print(f"Python executable: {sys.executable}")
try:
    import requests
    import dotenv
    print("Modules imported successfully.")
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found.")
    sys.exit(1)

print(f"API Key found: {api_key[:5]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    print(f"Requesting {url}...")
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Available Models:")
        for m in models:
            print(f"- {m['name']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
