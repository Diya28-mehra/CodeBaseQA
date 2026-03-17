-- This is the SQL script to create the necessary table and functions in your Supabase database.
-- You need to run this in your Supabase SQL Editor.

-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your chunks
create table if not exists code_chunks (
  id bigint primary key generated always as identity,
  file_path text not null,
  start_line int not null,
  end_line int not null,
  content text not null,
  embedding vector(384) -- all-MiniLM-L6-v2 model uses 384 dimensions
);

-- Create a function to search for chunks
create or replace function match_code_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  file_path text,
  start_line int,
  end_line int,
  content text,
  similarity float
)
language sql stable
as $$
  select
    code_chunks.id,
    code_chunks.file_path,
    code_chunks.start_line,
    code_chunks.end_line,
    code_chunks.content,
    1 - (code_chunks.embedding <=> query_embedding) as similarity
  from code_chunks
  where 1 - (code_chunks.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
