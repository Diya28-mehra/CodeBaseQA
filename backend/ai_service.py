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

    def generate_answer(self, query: str, context_chunks: List[Dict]) -> str:
        """
        Syntheses an answer based on provided code chunks.
        Optimized to stay within Groq Free Tier TPM limits (6000 tokens).
        """
        if not self.client:
            return "Error: GROQ_API_KEY is missing."

        if not context_chunks:
            return "I couldn't find any relevant code snippets."

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
        You are a senior software engineer. Answer the user's question directly and confidently based ONLY on the provided code snippets.
        
        RESPONSE GUIDELINES:
        - **Direct Answer**: Start with the answer. No "Based on..." or "Summary:" labels.
        - **Tone**: Professional, technical, and concise. Avoid fluff.
        - **Confidence Score**: At the end of your answer, include:
          **Confidence**: [High/Medium/Low] - [One sentence justification]
        - **Evidence Section**: At the very bottom, use the marker `--- EVIDENCE ---` followed by a list of key files and line ranges.

        CRITICAL RULES:
        1. Cite file paths and line numbers (e.g., [components/Button.tsx: L10-25]) inline for every technical claim.
        2. Use clean Markdown for headers, lists, and code blocks.
        3. If the answer is missing from the snippets, state it clearly.

        Context from Codebase:
        {context_str}

        User Question: {query}
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
