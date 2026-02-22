from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import os
import shutil
from dotenv import load_dotenv
from typing import Optional, List

from ingestion_service import IngestionService
from processor_service import ProcessorService
from vector_service import VectorService
from ai_service import AIService
from session_service import SessionService

load_dotenv()

app = FastAPI(title="Codebase Q&A API")

ingestion_service = IngestionService()
processor_service = ProcessorService()
vector_service = VectorService()
ai_service = AIService()
session_service = SessionService()

class GitHubRepo(BaseModel):
    url: str

class Query(BaseModel):
    query: str

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Codebase Q&A API"}

@app.get("/health")
async def health_check():
    # Placeholder checks for database and LLM
    db_status = "ok"
    llm_status = "ok"
    
    return {
        "status": "healthy",
        "backend": "ok",
        "database": db_status,
        "llm": llm_status
    }

@app.post("/ingest/github")
async def ingest_github(repo: GitHubRepo):
    try:
        # 1. Ingest (Clone)
        files = ingestion_service.process_github(repo.url)
        
        # 2. Process (Chunk)
        chunks = processor_service.chunk_code(files)
        
        # 3. Vectorize & Store
        await vector_service.upsert_chunks(chunks)
        
        return {
            "message": "Ingestion complete",
            "file_count": len(files),
            "chunk_count": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(query_data: Query):
    """
    Q&A Endpoint: Search similar chunks and generate an answer using LLM.
    """
    try:
        # 1. Check for Greeting (Fast Path)
        if query_data.query.lower().strip() in ["hi", "hello", "hey", "greetings"]:
            return {
                "answer": "Hi! I am CodeBaseQA. I can help you navigate and understand your codebase. What would you like to know?",
                "proof": []
            }
        
        # 2. Fetch History
        history = session_service.get_recent_sessions(limit=5)
        # Reverse to get chronological order (Oldest -> Newest)
        history.reverse()

        # 3. Contextualize Query (Rewrite if needed)
        search_query = ai_service.contextualize_query(query_data.query, history)
        
        # 4. Search with refined query
        relevant_chunks = vector_service.search_similar_chunks(search_query, limit=3)
        
        if not relevant_chunks and search_query != query_data.query:
             # Fallback: if rewritten query fails, try original
             relevant_chunks = vector_service.search_similar_chunks(query_data.query, limit=3)

        # 5. Generate answer using AIService
        # We pass the search_query so the LLM has the resolved context
        answer = ai_service.generate_answer(search_query, relevant_chunks, history)
        
        # 6. Save to History (Save ORIGINAL query to preserve user intent in UI)
        session_service.save_session(query_data.query, answer, relevant_chunks)
        
        return {
            "answer": answer,
            "proof": relevant_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A Error: {str(e)}")

@app.get("/history")
async def get_history():
    """
    Returns the last 10 Q&A sessions.
    """
    try:
        history = session_service.get_recent_sessions(limit=10)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
