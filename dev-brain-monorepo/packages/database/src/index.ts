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
    // Safety check: ensure the extension exists before we try to register types
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    // Now register the types
    await pgvector.registerTypes(client);
    
    console.log('✅ Vector extension verified and types registered');
  } catch (err) {
    console.error('❌ Failed to initialize Vector DB:', err);
    throw err;
  } finally {
    client.release();
  }
};