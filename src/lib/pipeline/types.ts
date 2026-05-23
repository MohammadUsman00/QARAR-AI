export const PIPELINE_VERSION = "pipeline-v1-2026-05-23";

export type PastDecision = {
  id?: string;
  title: string;
  raw_input: string;
  domain?: string | null;
  created_at?: string;
  embedding?: number[] | null;
};

export type OnboardingAnswers = {
  regrets?: string[];
  weakness?: string | null;
  why?: string | null;
};

export type RetrievalMethod = "embedding" | "text" | "recency";

export type PipelineContext = {
  relevantDecisions: PastDecision[];
  historySummary: string | null;
  onboardingSnippet: string | null;
  retrievalMethod: RetrievalMethod;
  pipelineVersion: string;
};

export type AutopsyRow = {
  cognitive_biases: { name?: string; severity?: string }[] | null;
  emotional_triggers: { trigger?: string; pattern?: string }[] | null;
  estimated_cost_inr?: number | null;
  created_at?: string;
};

export type DecisionForAggregate = {
  domain: string | null;
  outcome_rating: number | null;
  created_at: string;
  emotional_state_before?: string | null;
};
