import fs from 'fs';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

const chunks = JSON.parse(fs.readFileSync('./chunks.json', 'utf-8'));

async function embedAll() {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const input = `${chunk.title || chunk.name}: ${chunk.content}`;
    const { data } = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: input
    });
    await index.namespace('noble').upsert([
      {
        id: `chunk-${i}`,
        values: data[0].embedding,
        metadata: chunk
      }
    ]);
    console.log(`✅ Embedded chunk ${i + 1}/${chunks.length}`);
  }
}
embedAll();
