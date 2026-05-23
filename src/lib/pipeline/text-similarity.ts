const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "he",
  "she",
  "it",
  "they",
  "them",
  "their",
  "this",
  "that",
  "these",
  "those",
  "not",
  "no",
  "so",
  "if",
  "then",
  "than",
  "too",
  "very",
  "just",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  return tf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  a.forEach((v) => {
    normA += v * v;
  });
  b.forEach((v) => {
    normB += v * v;
  });

  const keys = new Set<string>();
  a.forEach((_, k) => keys.add(k));
  b.forEach((_, k) => keys.add(k));
  keys.forEach((k) => {
    dot += (a.get(k) ?? 0) * (b.get(k) ?? 0);
  });

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function textSimilarityScore(query: string, document: string): number {
  const qTf = termFrequency(tokenize(query));
  const dTf = termFrequency(tokenize(document));
  return cosineSimilarity(qTf, dTf);
}

export function rankByTextSimilarity<T extends { raw_input: string }>(
  query: string,
  items: T[],
  k: number,
): { item: T; score: number }[] {
  return items
    .map((item) => ({
      item,
      score: textSimilarityScore(query, item.raw_input),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
