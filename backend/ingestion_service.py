import os
import shutil
import zipfile
import tempfile
from git import Repo
from pathlib import Path

class IngestionService:
    def __init__(self):
        self.allowed_extensions = {
            '.py', '.js', '.jsx', '.ts', '.tsx', '.go', '.java', '.c', '.cpp', '.h', 
            '.html', '.css', '.md', '.txt', '.yaml', '.yml', '.json', '.env', '.sql',
            '.sh', '.bash', '.mjs', '.cjs', '.ejs', '.php', '.rb', '.rs'
        }
        self.ignored_dirs = {
            'node_modules', '.git', 'venv', '.venv', '__pycache__', 'dist', 'build', 
            '.next', '.vscode', '.github', 'assets', 'uploads', 'images', 'coverage',
            '.cache', 'tmp', 'logs', 'out', '.sass-cache', 'public/assets'
        }

    def should_process_file(self, file_path: Path) -> bool:
        # Ignore hidden files/dirs
        if any(part.startswith('.') and part != '.' for part in file_path.parts):
            if not any(part in ['.github'] for part in file_path.parts): # Allow .github for context
                 return False
        
        # Check ignored directories
        if any(ignored in file_path.parts for ignored in self.ignored_dirs):
            return False
            
        # Check extensions
        return file_path.suffix.lower() in self.allowed_extensions

    def process_github(self, repo_url: str) -> list[dict]:
        processed_files = []
        with tempfile.TemporaryDirectory() as temp_dir:
            Repo.clone_from(repo_url, temp_dir, depth=1)
            
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    full_path = Path(root) / file
                    relative_path = full_path.relative_to(temp_dir)
                    
                    if self.should_process_file(relative_path):
                        try:
                            with open(full_path, 'r', encoding='utf-8') as f:
                                content = f.read()
                                processed_files.append({
                                    "path": str(relative_path),
                                    "content": content
                                })
                        except Exception as e:
                            print(f"Error reading {full_path}: {e}")
                            
        return processed_files
