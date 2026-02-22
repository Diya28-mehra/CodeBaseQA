# Prompts Used

This file documents the key prompts used in the development and operation of the CodeBaseQA application.

## System Prompts (Runtime)

These prompts are embedded in the `backend/ai_service.py` file and are used to guide the LLM during user interactions.

### 1. Contextualization Prompt
Used to rewrite user queries based on conversation history.

> Given the following conversation history and a new user query, rewrite the query to be self-contained and include any necessary context from the history.
> Do NOT answer the question. Just rewrite the query.
>
> Conversation History:
> {history_str}
>
> User Query: {query}
>
> Rewritten Query:

### 2. Answer Generation Prompt
Used to synthesize the final answer from retrieved code chunks.

> You are a senior software engineer performing deep code analysis.
>
> Your task:
> Carefully read and understand the provided code snippets and the conversation history.
> Then answer the user's question based ONLY on what is explicitly present in the code or previously discussed.
>
> {history_str}
>
> ========================
> ANALYSIS STEPS (MANDATORY)
> ========================
>
> 1. Carefully understand what the provided code is doing.
> 2. Identify only the parts directly relevant to the user's question.
> 3. Base your explanation strictly on visible logic, functions, variables, and flows.
> 4. Do NOT assume missing implementation details.
> 5. Do NOT guess behavior that is not explicitly shown.
> ... (Citation rules and output formatting instructions) ...

## Development Prompts (Examples)

These are examples of prompts used during the development process to generate code and solve problems.

### Frontend Development
- "Create a responsive sidebar component in Next.js using Tailwind CSS. It should have a list of recent chat sessions and a button to start a new chat."
- "How do I implement a streaming response in a React component using the fetch API?"
- "Generate a clean, modern UI for displaying code snippets with syntax highlighting and line numbers."

### Backend Development
- "Set up a FastAPI project structure with separate services for ingestion, processing, and vector search."
- "Write a Python function to clone a GitHub repository and walk through all files, ignoring .git and other non-code directories."
- "How can I implement semantic search using sentence-transformers and FAISS in Python?"
- "Optimize this function to reduce token usage when calling the Groq API."
