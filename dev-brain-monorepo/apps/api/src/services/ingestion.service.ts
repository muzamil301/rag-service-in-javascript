import { pool } from '@dev-brain/database';
import { generateEmbedding } from './embedding.service';

export const ingestDocument = async (content: string, metadata: any) => {
  // 1. Generate Vector
  const embedding = await generateEmbedding(content);

  // 2. Save to DB (pgvector uses the <=> or <-> operators)
  const query = `
    INSERT INTO document_sections (content, embedding, metadata)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;

  const values = [content, JSON.stringify(embedding), metadata];
  const res = await pool.query(query, values);
  return res.rows[0].id;
};