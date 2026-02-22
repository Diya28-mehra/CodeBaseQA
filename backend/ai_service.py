import os
from typing import List, Dict
from groq import Groq

class AIService:
    def __init__(self):
        # Configure Groq
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            self.client = None
        else:
            self.client = Groq(api_key=api_key)
        
        self.model = "llama-3.1-8b-instant"

    def contextualize_query(self, query: str, history: List[Dict]) -> str:
        """
        Rewrites the user query based on conversation history to make it self-contained for vector search.
        """
        if not self.client or not history:
            return query

        # Create a prompt for query rewriting
        history_str = ""
        for session in history[-3:]: 
            history_str += f"User: {session.get('query', '')}\n"
            history_str += f"Assistant: {session.get('answer', '')}\n\n"

        prompt = f"""
        Given the following conversation history and a new user query, rewrite the query to be self-contained and include any necessary context from the history.
        Do NOT answer the question. Just rewrite the query.
        
        Conversation History:
        {history_str}
        
        User Query: {query}
        
        Rewritten Query:
        """
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that rewrites queries to be self-contained."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=200
            )
            rewritten = completion.choices[0].message.content.strip()
            print(f"Original: {query} -> Rewritten: {rewritten}")
            return rewritten
        except Exception as e:
            print(f"Error rewriting query: {e}")
            return query

    def generate_answer(self, query: str, context_chunks: List[Dict], history: List[Dict] = []) -> str:
        """
        Syntheses an answer based on provided code chunks and conversation history.
        Optimized to stay within Groq Free Tier TPM limits (6000 tokens).
        """
        if not self.client:
            return "Error: GROQ_API_KEY is missing."

        # Handle Greetings
        if query.lower().strip() in ["hi", "hello", "hey", "greetings"]:
            return "Hi! I am CodeBaseQA. I can help you navigate and understand your codebase. What would you like to know?"

        if not context_chunks:
            return "I couldn't find any relevant code snippets."

        # Process History
        history_str = ""
        if history:
            history_str = "=== CONVERSATION HISTORY ===\n"
            # Limit to last 3 interactions to save tokens
            for session in history[-3:]: 
                history_str += f"User: {session.get('query', '')}\n"
                history_str += f"Assistant: {session.get('answer', '')}\n\n"

        context_str = ""
        # We only take the top 3 most relevant chunks to save tokens
        for i, chunk in enumerate(context_chunks[:3]):
            content = chunk['content']
            # Safety: If a single chunk is massive (e.g. 1000 lines), 
            # we truncate it to ~4000 chars (~1000 tokens) to be safe.
            if len(content) > 4000:
                content = content[:4000] + "\n... (truncated for brevity) ..."
                
            context_str += f"--- Snippet {i+1} ---\n"
            context_str += f"File: {chunk['file_path']}\n"
            context_str += f"Lines: {chunk['start_line']}-{chunk['end_line']}\n"
            context_str += f"Content:\n{content}\n\n"

        prompt = f"""
            You are a senior software engineer performing deep code analysis.

            Your task:
            Carefully read and understand the provided code snippets and the conversation history.
            Then answer the user's question based ONLY on what is explicitly present in the code or previously discussed.
            
            {history_str}

            ========================
            ANALYSIS STEPS (MANDATORY)
            ========================

            1. Carefully understand what the provided code is doing.
            2. Identify only the parts directly relevant to the user's question.
            3. Base your explanation strictly on visible logic, functions, variables, and flows.
            4. Do NOT assume missing implementation details.
            5. Do NOT guess behavior that is not explicitly shown.

            If the snippets do NOT contain enough information to answer the question, respond exactly with:

            The provided snippets do not contain enough information to answer this.

            Do not add anything else in that case.

            ========================
            CITATION RULES
            ========================

            - Every technical claim MUST include a citation.
            - Format:
            [file_path:start_line-end_line]
            - If multiple claims come from the SAME file and SAME line range,
            cite it only ONCE.
            - Do NOT repeatedly cite identical file + line ranges.
            - Merge overlapping references when possible.
            - Example:
            Retries are handled using exponential backoff [utils/retry.py:10-42].

            ========================
            OUTPUT RULES
            ========================

            - Start directly with the explanation.
            - Be clear and technical.
            - Do NOT repeat the question.
            - Do NOT say "Based on the snippets".
            - Do NOT add unnecessary formatting sections.
            - Only explain what is supported by code.

            End the answer with:

            Confidence: 0.xx

            Where:
            - 0.90+ = strongly supported by explicit code
            - 0.70–0.89 = mostly supported but partially inferred
            - Below 0.70 = weak evidence

            Do not write anything after the confidence line.

            ========================
            CODE SNIPPETS
            ========================

            {context_str}

            ========================
            USER QUESTION
            ========================

            {query}
            """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful codebase assistant. Always provide proof with file paths and line numbers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1024 # Reduced max_tokens to save room
            )
            return completion.choices[0].message.content
        except Exception as e:
            if "rate_limit" in str(e).lower():
                return "Error: Groq Rate Limit exceeded. Please wait 60 seconds."
            return f"Error with Groq API: {str(e)}"
