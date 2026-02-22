# Application Usage Steps

This document outlines the step-by-step process for using the CodeBaseQA application.

## 1. Ingest a Codebase

Before you can ask questions, you need to ingest a GitHub repository.

1.  Click the **"Ingest Codebase"** button in the top right corner of the application header.
2.  A modal window will appear. Enter the full URL of the GitHub repository you want to analyze (e.g., `https://github.com/username/repo`).
3.  Click **"Ingest"** to start the process.
4.  Wait for the ingestion to complete. The system will clone the repository, process the files into chunks, and store them in the vector database.
5.  Once complete, the modal will close automatically or show a success message.

## 2. Ask Questions

Once a codebase is ingested, you can start asking questions about it.

1.  Locate the chat input box at the bottom of the screen.
2.  Type your question (e.g., "How is authentication handled?" or "Explain the main.py file").
3.  Press **Enter** or click the send icon.
4.  The AI will analyze your query, search for relevant code snippets, and generate a context-aware answer.

## 3. View Code Proofs (Citations)

The AI's answers are backed by actual code from the repository.

1.  In the AI's response, look for citations or references to specific files (often formatted as `[file_path:line-numbers]`).
2.  Click on a citation to open the **Proof Viewer**.
3.  The Proof Viewer will display the actual code file with the relevant lines highlighted, allowing you to verify the AI's explanation.

## 4. Manage Conversation History

The application saves your chat sessions for future reference.

1.  Open the **Sidebar** by clicking the menu icon in the top left corner (if it's collapsed).
2.  You will see a list of recent chat sessions.
3.  Click on a session to load the previous conversation and continue asking questions in that context.
