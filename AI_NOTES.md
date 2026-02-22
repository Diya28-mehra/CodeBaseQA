# AI Notes

This document outlines the AI technologies used in the project, the reasons for their selection, and how AI was leveraged during development.

## LLM Provider

- **Provider:** Groq
- **Model:** `llama-3.1-8b-instant`
- **Why:**
  - **Speed:** Groq's inference engine is exceptionally fast, allowing for near-instantaneous responses which is critical for a smooth user experience in a chat interface.
  - **Cost:** The Llama-3.1-8b model on Groq is optimized to stay within free tier limits (6000 tokens per minute), making it a sustainable choice for development and testing.
  - **Performance:** Despite being a smaller model (8b), it performs exceptionally well on code understanding tasks when provided with relevant context.

## AI Usage & Development Assistance

AI played a crucial role in both the application's functionality and its development lifecycle:

- **Query Contextualization:** Rewrites user queries to include conversation history, ensuring vector search is accurate even for follow-up questions.
- **Answer Generation:** Synthesizes answers from retrieved code chunks, providing clear explanations backed by citations to reduce hallucinations.
- **Code Generation:** Accelerated development by generating boilerplate code for frontend components and FastAPI endpoints.
- **Debugging:** Assisted in troubleshooting complex state management issues in the frontend and async handling in the backend.
- **Documentation:** Helped structure and draft project documentation.

## Manual Verification

While AI was used extensively, critical components were manually verified to ensure reliability and efficiency:

- **Vector Search Logic:** Manually checked the relevance of retrieved chunks against specific queries to ensure the embedding model was working correctly.
- **Citation Accuracy:** Verified that the line numbers and file paths provided by the AI in the answers matched the actual source code.
- **Security:** Personally reviewed the handling of API keys and environment variables to ensure no sensitive information was exposed.
- **Greeting Handling:** Implemented a manual check for greetings (e.g., "Hi", "Hello") to provide an immediate response explaining the app's purpose, saving AI tokens for actual queries.
- **Model Selection:** Experimented with multiple LLMs and providers to verify that `llama-3.1-8b-instant` offered the best performance while strictly adhering to free tier rate limits.
