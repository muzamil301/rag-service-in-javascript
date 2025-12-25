CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,                -- The actual text chunk
    metadata JSONB,                       -- Source URL, tags, or timestamps
    embedding VECTOR(384),               -- Match this to your model (1536 for OpenAI)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Index for performance (HNSW is generally faster for AI agents than IVFFlat)
CREATE INDEX ON document_sections USING hnsw (embedding vector_cosine_ops);