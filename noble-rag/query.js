import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

export async function getAnswer(query) {
  const { data } = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });

  const search = await index.namespace('noble').query({
    vector: data[0].embedding,
    topK: 4,
    includeMetadata: true
  });

  const context = search.matches.map(m => `${m.metadata.title || m.metadata.name}: ${m.metadata.content}`).join('\n\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful dental clinic assistant for Noble Dental Care. Only answer based on the given context.' },
      { role: 'user', content: `Answer this: "${query}"\n\nContext:\n${context}` }
    ]
  });

  return {
    answer: completion.choices[0].message.content,
    context: context
  };
}
