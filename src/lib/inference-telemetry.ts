export type InferenceEvent = {
  requestId: string;
  route: string;
  userId: string;
  model: string;
  promptVersion: string;
  schemaVersion: string;
  status: "success" | "validation_error" | "rate_limited" | "provider_error" | "parse_error" | "timeout";
  latencyMs?: number;
  tokensApprox?: number;
  error?: string;
};

export function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function logInferenceEvent(event: InferenceEvent) {
  console.info(
    JSON.stringify({
      type: "ai_inference",
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
}
