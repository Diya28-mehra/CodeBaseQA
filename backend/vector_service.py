import os
import time
from typing import List, Dict
from supabase import create_client, Client
from huggingface_hub import InferenceClient

class VectorService:
    def __init__(self):
        # Using the official InferenceClient for better reliability
        # Model: all-MiniLM-L6-v2 (Dimensions: 384)
        self.client = InferenceClient(
            model="sentence-transformers/all-MiniLM-L6-v2",
            token=os.getenv("HUGGINGFACE_API_KEY")
        )
        
        # Configure Supabase
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )

    def get_embedding(self, text: str) -> List[float]:
        """
        Converts text into a numerical vector using Hugging Face InferenceClient.
        """
        try:
            # InferenceClient handles the URL and authentication automatically
            embedding = self.client.feature_extraction(text)
            # feature_extraction might return a nested list or a flat list depending on input
            if isinstance(embedding, list) and len(embedding) > 0 and isinstance(embedding[0], list):
                return embedding[0]
            return embedding.tolist() if hasattr(embedding, 'tolist') else embedding
        except Exception as e:
            if "loading" in str(e).lower():
                print("Model is warming up on Hugging Face, waiting 20s...")
                time.sleep(20)
                return self.get_embedding(text)
            raise e

    async def upsert_chunks(self, chunks: List[Dict]):
        """
        Processes chunks, generates embeddings via HF, and saves to Supabase.
        """
        if not chunks:
            return None

        data_to_insert = []
        total = len(chunks)
        print(f"🚀 Processing {total} chunks via Hugging Face Inference API...")

        for i, chunk in enumerate(chunks):
            try:
                # Get embedding using the robust client
                embedding = self.get_embedding(chunk["content"])
                
                data_to_insert.append({
                    "file_path": chunk["file_path"],
                    "start_line": chunk["start_line"],
                    "end_line": chunk["end_line"],
                    "content": chunk["content"],
                    "embedding": embedding
                })
                
                if (i + 1) % 10 == 0:
                    print(f"✅ Generated {i + 1}/{total} embeddings...")
                
                # Small breathe time for the free tier
                time.sleep(0.5)
            
            except Exception as e:
                print(f"Error for {chunk['file_path']}: {e}")
            
        if data_to_insert:
            print(f"💾 Saving {len(data_to_insert)} chunks to Supabase...")
            batch_size = 50
            for j in range(0, len(data_to_insert), batch_size):
                sub_batch = data_to_insert[j:j + batch_size]
                try:
                    self.supabase.table("code_chunks").upsert(sub_batch).execute()
                except Exception as e:
                    print(f"Supabase error during batch {j}: {e}")
            
            print("✨ Ingestion Complete! All chunks stored.")
            return True
        return None

    def search_similar_chunks(self, query: str, limit: int = 5):
        """
        Converts query to embedding and finds similar code in Supabase.
        """
        print(f"🔍 Searching for: {query}")
        query_embedding = self.get_embedding(query)
        print(f"✅ Generated query embedding (Size: {len(query_embedding)})")
        
        rpc_params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.1, # Lowered threshold to see if we get anything
            "match_count": limit,
        }
        
        try:
            result = self.supabase.rpc("match_code_chunks", rpc_params).execute()
            print(f"🔎 Found {len(result.data)} matches.")
            return result.data
        except Exception as e:
            print(f"❌ Supabase Search Error: {e}")
            return []
