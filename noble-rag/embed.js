import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

async function embedLocal() {
  // 1. Create the local embedding pipeline
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );

  // 2. Read chunked data
  const chunksPath = path.resolve('./chunks.json');
  if (!fs.existsSync(chunksPath)) {
    console.error('Error: chunks.json file not found. Place it in the project root.');
    process.exit(1);
  }
  const chunks = JSON.parse(fs.readFileSync(chunksPath, 'utf-8'));

  // 3. Initialize Pinecone
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.index(process.env.PINECONE_INDEX);

  // 4. Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      // Generate embedding (384-dim)
      const out = await extractor([chunk.title || chunk.content], { pooling: 'mean', normalize: true });
      const vector = Array.from(out.data[0]);

      // Upload to Pinecone
      await index.namespace('noble').upsert([
        {
          id: `chunk-${i}`,
          values: vector,
          metadata: chunk,
        }
      ]);
      console.log(`✅ Embedded piece ${i + 1}/${chunks.length}`);
    } catch (err) {
      console.error(`Error embedding chunk ${i}:`, err);
      continue;
    }
  }
  console.log('All chunks successfully embedded!');
}

embedLocal().catch(console.error);
