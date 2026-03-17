from dotenv import load_dotenv
load_dotenv()

from vector_service import VectorService

v = VectorService()
print("Initialized VectorService")

try:
    print("Testing get_embedding...")
    emb = v.get_embedding("What does this codebase do?")
    print(f"Embedding generated! Length: {len(emb)}")
except Exception as e:
    print(f"Error generating embedding: {e}")

try:
    print("\nTesting search_similar_chunks...")
    results = v.search_similar_chunks("What does this codebase do?", limit=3)
    print(f"Results type: {type(results)}")
    print(f"Number of results: {len(results)}")
    if results:
        print(f"First result keys: {results[0].keys()}")
        print(f"First result distance: {results[0].get('similarity')}")
except Exception as e:
    print(f"Error searching chunks: {e}")
