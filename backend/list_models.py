import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Listing all available models...")
for m in genai.list_models():
    if 'embedContent' in m.supported_generation_methods:
        print(f"Model: {m.name}, Methods: {m.supported_generation_methods}")
