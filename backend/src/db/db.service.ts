import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

// 🚨 IMPORTANT: Replace these dummy credentials with your actual PostgreSQL credentials
// You should ideally use NestJS ConfigModule and environment variables (.env file)
const DB_CONFIG = {
  user: 'postgres', // e.g., 'agent_user'
  host: 'localhost',
  database: 'agent_poc_db', // The DB you will create manually
  password: 'postgres', // e.g., 'supersecurepwd'
  port: 5432,
};

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private pool: Pool;

  async onModuleInit() {
    // Debug: Log configuration (without password for security)
    console.log('🔍 [DEBUG] Database Configuration:');
    console.log('  - Host:', DB_CONFIG.host);
    console.log('  - Port:', DB_CONFIG.port);
    console.log('  - User:', DB_CONFIG.user);
    console.log('  - Database:', DB_CONFIG.database);
    console.log('  - Password:', DB_CONFIG.password ? '***' + DB_CONFIG.password.slice(-2) : 'NOT SET');
    console.log('  - Full Config (sanitized):', {
      ...DB_CONFIG,
      password: '***REDACTED***',
    });

    this.pool = new Pool(DB_CONFIG);

    try {
      console.log('🔍 [DEBUG] Attempting to connect to PostgreSQL...');
      const client = await this.pool.connect();
      console.log('🔍 [DEBUG] Connection successful!');
      client.release();
      this.logger.log('✅ PostgreSQL connection pool initialized.');
      await this.createTables(); // Execute Milestone 1.4 logic here
    } catch (error: unknown) {
      console.error('🔍 [DEBUG] Connection Error Details:');
      if (error && typeof error === 'object') {
        const pgError = error as { code?: string; message?: string; severity?: string };
        console.error('  - Error Code:', pgError.code || 'N/A');
        console.error('  - Error Message:', pgError.message || 'Unknown error');
        console.error('  - Error Severity:', pgError.severity || 'N/A');
      }
      console.error('  - Full Error:', JSON.stringify(error, null, 2));
      this.logger.error('Failed to connect to PostgreSQL. Check your config and Docker/service status.', error);
      // In a real application, you might throw a specific error here or implement retry logic
    }
  }

  // --- Core Methods for Querying ---

  /**
   * Executes a raw SQL query with optional parameters.
   */
  async query(text: string, params: any[] = []): Promise<QueryResult> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Executed query in ${duration}ms: ${text.split('\n')[0].trim()}...`);
      return res;
    } catch (error) {
      this.logger.error(`Error executing query: ${text.split('\n')[0].trim()}...`, error.stack);
      throw error;
    }
  }
  
  // This method will be used by LangChain's PGVectorStore later (Milestone 2)
  getPool(): Pool {
      return this.pool;
  }

  // --- Cleanup ---
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed.');
  }

// Milestone 1.4 will be implemented here 👇
private async createTables() {
    // 1. Table for Structured Data (Chat History)
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        -- Storing conversation data, linked to LangGraph thread ID later
        thread_id VARCHAR(255) DEFAULT 'default_thread',
        role VARCHAR(10) NOT NULL, -- 'user' or 'agent'
        message_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Table for Unstructured Data (Vector Embeddings)
    // NOTE: VECTOR(384) is for the all-minilm embedding model.
    const createVectorsTable = `
      CREATE TABLE IF NOT EXISTS document_vectors (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        source_file VARCHAR(255),
        embedding VECTOR(384)
      );
    `;

    try {
      // Must enable the vector extension first (do this manually in your DB tool)
      await this.query('CREATE EXTENSION IF NOT EXISTS vector;');
      this.logger.log('PostgreSQL extension "vector" ensured.');

      await this.query(createConversationsTable);
      this.logger.log('Table "conversations" checked/created.');

      await this.query(createVectorsTable);
      this.logger.log('Table "document_vectors" checked/created.');
    
  } catch (error: any) {
      this.logger.error('FATAL: Could not create tables. Is pgvector extension installed?', error.stack);
      throw error;
    }
  }
}
