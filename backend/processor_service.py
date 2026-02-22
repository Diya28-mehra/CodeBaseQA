from typing import List, Dict

class ProcessorService:
    def __init__(self, chunk_size: int = 300, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_code(self, files: List[Dict]) -> List[Dict]:
        """
        Takes a list of files (path and content) and returns a list of chunks with metadata.
        """
        all_chunks = []
        
        for file in files:
            path = file["path"]
            content = file["content"]
            lines = content.splitlines()
            total_lines = len(lines)
            
            # If the file is smaller than chunk size, take it as one chunk
            if total_lines <= self.chunk_size:
                all_chunks.append({
                    "file_path": path,
                    "start_line": 1,
                    "end_line": total_lines,
                    "content": content
                })
                continue
            
            # Use a sliding window to create chunks
            start = 0
            while start < total_lines:
                end = min(start + self.chunk_size, total_lines)
                chunk_lines = lines[start:end]
                
                all_chunks.append({
                    "file_path": path,
                    "start_line": start + 1,
                    "end_line": end,
                    "content": "\n".join(chunk_lines)
                })
                
                # Move the start pointer, but subtract the overlap
                # to maintain context between chunks
                if end == total_lines:
                    break
                
                start += (self.chunk_size - self.chunk_overlap)
                
        return all_chunks
