import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

def check_counts():
    try:
        chunks = supabase.table("code_chunks").select("id", count="exact").limit(1).execute()
        sessions = supabase.table("qa_sessions").select("id", count="exact").limit(1).execute()
        
        print(f"Total rows in code_chunks: {chunks.count}")
        print(f"Total rows in qa_sessions: {sessions.count}")
    except Exception as e:
        print(f"Error checking counts: {e}")

if __name__ == "__main__":
    check_counts()
