import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Counter, Ticket } from './models.js';
import { queueRoutes } from './queue.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env') });

const { MONGODB_URI, QUEUE_CODE, PORT = 5000 } = process.env;
if (!MONGODB_URI || !/^\d{4}(\d{2})?$/.test(QUEUE_CODE ?? '')) {
  console.error('Set MONGODB_URI and a 4- or 6-digit QUEUE_CODE in .env.');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use('/api', queueRoutes(QUEUE_CODE));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use(express.static(path.join(root, 'client/dist')));
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request.' });
  }
  console.error(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await Ticket.init();
  await Counter.updateOne({ _id: 'tickets' }, { $setOnInsert: { value: 0 } }, { upsert: true });
  app.listen(PORT, () => console.log(`Queue server running at http://localhost:${PORT}`));
} catch (error) {
  console.error('Could not start the server:', error.message);
  process.exit(1);
}
