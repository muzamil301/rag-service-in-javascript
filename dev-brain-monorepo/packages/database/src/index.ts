import pg from 'pg';
import pgvector from 'pgvector/pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'dev_brain_poc_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// CRITICAL: Automatically register types for EVERY new connection in the pool
pool.on('connect', async (client) => {
  await pgvector.registerTypes(client);
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    // 1. Ensure the pgvector extension is installed
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    // 2. Register vector types for the current connection
    await pgvector.registerTypes(client);
    
    // 3. Automatically create the table with 384 dimensions (for all-minilm)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS document_sections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        content text NOT NULL,
        metadata jsonb,
        embedding vector(384) 
      );
    `;
    await client.query(createTableQuery);

    // 4. (Optional) Add an HNSW index for faster vector searching as your data grows
    await client.query(`
      CREATE INDEX IF NOT EXISTS document_sections_embedding_idx 
      ON document_sections USING hnsw (embedding vector_cosine_ops);
    `);
    
    console.log('✅ Database initialized: Extension, Types, and Table are ready.');
  } catch (err) {
    console.error('❌ Failed to initialize Vector DB:', err);
    throw err;
  } finally {
    client.release();
  }
};

export const clearTable = async (tableName: string) => {
  const client = await pool.connect();
  try {
    // TRUNCATE is faster than DELETE for clearing entire tables
    await client.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
    console.log(`🧹 Table ${tableName} cleared.`);
  } finally {
    client.release();
  }
};

export const getDocumentCount = async (tableName: string): Promise<number> => {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
    return parseInt(res.rows[0].count, 10);
  } finally {
    client.release();
  }
};
