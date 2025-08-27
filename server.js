import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { getAnswer } from './query.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).send('Missing question');

  try {
    const result = await getAnswer(question);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating answer');
  }
});

app.listen(3000, () => {
  console.log(`🚀 RAG server running at http://localhost:3000`);
});
