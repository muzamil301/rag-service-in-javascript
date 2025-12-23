import express from 'express';
import { getDbStatus } from './services/db.service';

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const status = await getDbStatus();
    res.json({ status: 'OK', dbTime: status.now });
  } catch (err) {
    res.status(500).json({ status: 'Error', message: (err as Error).message });
  }
});

app.listen(3001, () => console.log('🚀 API on http://localhost:3001'));