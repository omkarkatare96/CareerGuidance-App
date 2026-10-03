import urllib.request
import json
import os

api_key = "AIzaSyAYguXNsRiR1YPMib8SwbCLwACF69H6hMk"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    with urllib.request.urlopen(url) as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            print("Available Models:")
            for m in data.get('models', []):
                print(f"- {m['name']}")
        else:
            print(f"Error: {response.status}")
except Exception as e:
    print(f"Error: {e}")
