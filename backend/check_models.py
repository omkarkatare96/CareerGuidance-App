import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"

try:
    response = requests.get(URL)
    if response.status_code == 200:
        models = response.json().get('models', [])
        print("Available Models:")
        for m in models:
            if 'generateContent' in m.get('supportedGenerationMethods', []):
                print(f"- {m['name']}")
    else:
        print(f"Error fetching models: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {e}")
