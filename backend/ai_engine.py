from google import genai
from google.genai.types import GenerateContentConfig
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# Create Gemini client
client = genai.Client(api_key=API_KEY)


def generate_content(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash-latest",
            contents=prompt,
            config=GenerateContentConfig(
                temperature=0.7
            )
        )

        return response.text

    except Exception as e:
        return f"Error generating content: {str(e)}"
