import { embedText, rankByEmbeddingSimilarity } from "@/lib/pipeline/embeddings";
import { rankByTextSimilarity } from "@/lib/pipeline/text-similarity";
import type {
  OnboardingAnswers,
  PastDecision,
  PipelineContext,
  RetrievalMethod,
} from "@/lib/pipeline/types";
import { PIPELINE_VERSION } from "@/lib/pipeline/types";

const DEFAULT_K = 5;
const RECENCY_BLEND = 3;

export function buildOnboardingSnippet(answers: OnboardingAnswers | null): string | null {
  if (!answers) return null;

  const parts: string[] = [];
  if (answers.regrets?.length) {
    parts.push(`Common regret areas: ${answers.regrets.join(", ")}.`);
  }
  if (answers.weakness) {
    parts.push(`Self-identified weakness: ${answers.weakness}.`);
  }
  if (answers.why) {
    parts.push(`Why they joined Qarar: ${answers.why}.`);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

/**
 * Hybrid retrieval: embedding similarity when available, else TF-IDF cosine, blended with recency.
 */
export async function retrieveRelevantDecisions(
  query: string,
  pastDecisions: PastDecision[],
  k = DEFAULT_K,
): Promise<{ decisions: PastDecision[]; method: RetrievalMethod }> {
  if (pastDecisions.length === 0) {
    return { decisions: [], method: "recency" };
  }

  const recent = [...pastDecisions]
    .sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    })
    .slice(0, RECENCY_BLEND);

  const queryEmbedding = await embedText(query);
  const withEmbeddings = pastDecisions.filter(
    (d) => d.embedding && d.embedding.length > 0,
  );

  if (queryEmbedding && withEmbeddings.length > 0) {
    const ranked = rankByEmbeddingSimilarity(queryEmbedding, withEmbeddings, k);
    const ids = new Set(ranked.map((r) => r.item.id ?? r.item.title));
    const merged = [
      ...ranked.map((r) => r.item),
      ...recent.filter((d) => !ids.has(d.id ?? d.title)),
    ].slice(0, k);

    return { decisions: merged, method: "embedding" };
  }

  const textRanked = rankByTextSimilarity(query, pastDecisions, k);
  if (textRanked[0]?.score > 0.05) {
    const ids = new Set(textRanked.map((r) => r.item.id ?? r.item.title));
    const merged = [
      ...textRanked.map((r) => r.item),
      ...recent.filter((d) => !ids.has(d.id ?? d.title)),
    ].slice(0, k);

    return { decisions: merged, method: "text" };
  }

  return {
    decisions: pastDecisions.slice(0, k),
    method: "recency",
  };
}

export async function buildPipelineContext(
  query: string,
  pastDecisions: PastDecision[],
  onboardingAnswers: OnboardingAnswers | null,
  existingSummary: string | null,
): Promise<PipelineContext> {
  const { decisions, method } = await retrieveRelevantDecisions(query, pastDecisions);

  return {
    relevantDecisions: decisions,
    historySummary: existingSummary,
    onboardingSnippet: buildOnboardingSnippet(onboardingAnswers),
    retrievalMethod: method,
    pipelineVersion: PIPELINE_VERSION,
  };
}
