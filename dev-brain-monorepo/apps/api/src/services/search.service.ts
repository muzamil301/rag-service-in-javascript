import { pool } from '@dev-brain/database';
import { generateEmbedding } from './embedding.service';

export const searchContext = async (query: string, limit: number = 3) => {
  const queryEmbedding = await generateEmbedding(query);
  
  const sql = `
    SELECT content, metadata, 1 - (embedding <=> $1) as similarity
    FROM document_sections
    WHERE 1 - (embedding <=> $1) > 0.4
    ORDER BY similarity DESC
    LIMIT $2;
  `;

  const res = await pool.query(sql, [JSON.stringify(queryEmbedding), limit]);
  return res.rows;
};