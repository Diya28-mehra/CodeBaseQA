import os
from typing import List, Dict
from supabase import create_client, Client

class SessionService:
    def __init__(self):
        # Configure Supabase
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.table = "qa_sessions"

    def save_session(self, query: str, answer: str, proof: List[Dict]):
        """
        Saves a Q&A session to Supabase.
        """
        data = {
            "query": query,
            "answer": answer,
            "proof": proof
        }
        try:
            result = self.supabase.table(self.table).insert(data).execute()
            return result.data
        except Exception as e:
            print(f"Error saving session: {e}")
            return None

    def get_recent_sessions(self, limit: int = 5):
        """
        Retrieves the last X Q&A sessions.
        """
        try:
            result = self.supabase.table(self.table)\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error fetching sessions: {e}")
            return []
