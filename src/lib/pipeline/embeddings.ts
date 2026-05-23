import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "text-embedding-004";

export function cosineSimilarityVectors(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function embedText(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(trimmed);
    const values = result.embedding?.values;
    return values && values.length > 0 ? [...values] : null;
  } catch {
    return null;
  }
}

export function rankByEmbeddingSimilarity<T extends { embedding?: number[] | null }>(
  queryEmbedding: number[],
  items: T[],
  k: number,
): { item: T; score: number }[] {
  return items
    .filter((item) => item.embedding && item.embedding.length > 0)
    .map((item) => ({
      item,
      score: cosineSimilarityVectors(queryEmbedding, item.embedding as number[]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
