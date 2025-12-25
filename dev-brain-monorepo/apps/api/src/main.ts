import express from 'express';
import { getDbStatus } from './services/db.service';
import { ingestDocument } from './services/ingestion.service';
import { searchContext } from './services/search.service';
import { bootstrapEmbeddingsData } from './scripts/bootstrap-data';
import { clearTable, getDocumentCount } from '@dev-brain/database';
import { brain } from '@dev-brain/ai-engine';
import { HumanMessage } from '@langchain/core/messages';

const app = express();
app.use(express.json());


app.get('/health', async (req, res) => {
  try {
    const dbTime = await getDbStatus();
    const docCount = await getDocumentCount('document_sections');
    
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      vectorCount: docCount, // This tells you if your "Brain" has data
      dbTime: dbTime.now 
    });
  } catch (err) {
    res.status(500).json({ status: 'Error', message: (err as Error).message });
  }
});

// 1. Ingest: "Learn" something new
app.post('/ingest', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    const id = await ingestDocument(content, metadata);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Search: Ask a question and get relevant context
app.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const results = await searchContext(query);
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Route to Trigger Bootstrap Embeddings Data
app.post('/bootstrap-embeddings-data', async (req, res) => {
  try {
    // We force a refresh by clearing first, or just run bootstrap
    // If your bootstrap script has the "if count > 0" check, 
    // you might want to remove it for this manual route.
    await bootstrapEmbeddingsData(); 
    res.json({ success: true, message: 'Mock data ingested successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Route to Wipe Data
app.delete('/clear-embeddings-data', async (req, res) => {
  try {
    await clearTable('document_sections');
    res.json({ success: true, message: 'Database wiped clean' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  const result = await brain.invoke({
    messages: [new HumanMessage(message)],
    // Inject the real DB search logic here!
    retriever: (query: string) => searchContext(query, 3) 
  });

  const response = result.messages[result.messages.length - 1];
  res.json({ 
    answer: response.content,
    debug: { type: result.queryType, docsFound: result.context.length }
  });
});

app.listen(3001, () => console.log('🚀 API on http://localhost:3001'));