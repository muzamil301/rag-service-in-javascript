import * as fs from 'node:fs';
import * as path from 'node:path';
import { pool } from '@dev-brain/database';
import { ingestDocument } from '../services/ingestion.service';

/**
 * Bootstrap the embeddings data from the data folder
*/
export const bootstrapEmbeddingsData = async () => {
  const dataPath = path.join(__dirname, '../data/');
  const files = fs.readdirSync(dataPath);

  // 1. Check if we already have data
  const countRes = await pool.query('SELECT count(*) FROM document_sections');
  if (parseInt(countRes.rows[0].count) > 0) {
    console.log('⏩ Data already exists. Skipping bootstrap.');
    return;
  }

  console.log('📂 Found files to ingest:', files);

  // 2. Loop and Ingest
  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(dataPath, file), 'utf-8');
      await ingestDocument(content, { source: file, type: 'documentation' });
      console.log(`✅ Ingested: ${file}`);
    }
  }
};
