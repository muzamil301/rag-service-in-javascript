-- Enable the pgvector extension in the 'vectordb' database
CREATE EXTENSION IF NOT EXISTS vector;

-- OPTIONAL: Create a sample table for immediate testing
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    description TEXT,
    # Define a vector column, e.g., for 1536-dimensional OpenAI embeddings
    embedding VECTOR(1536) 
);