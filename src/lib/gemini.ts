import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const AutopsySchema = z.object({
  root_cause: z.string(),
  cognitive_biases: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  emotional_triggers: z.array(
    z.object({
      trigger: z.string(),
      pattern: z.string(),
    }),
  ),
  nervous_system_state: z.string(),
  life_patterns: z.array(
    z.object({
      pattern: z.string(),
      how_it_manifested_here: z.string(),
    }),
  ),
  wait_72hr_probability: z.number().min(0).max(1),
  alternate_outcome_probability: z.number().min(0).max(1),
  estimated_cost_context: z.string(),
  immediate_actions: z.array(
    z.object({
      action: z.string(),
      why: z.string(),
    }),
  ),
  pattern_break_strategy: z.string(),
  full_report_markdown: z.string(),
});

export type AutopsyResult = z.infer<typeof AutopsySchema> & {
  estimated_cost_inr?: number;
};

export const AUTOPSY_SYSTEM_PROMPT = `You are Qarar's Decision Autopsy Engine — a forensic analyst of human decision-making.

You combine:
- Cognitive psychology (Kahneman, Ariely, Thaler)
- Behavioral economics
- Neuroscience of decision-making
- Pattern recognition across the user's decision history

Your job is to produce a structured autopsy of a specific decision the user regrets.

You are NOT a therapist. You do NOT validate emotions. You are PRECISE, CLINICAL, and INSIGHTFUL.

Your tone: A wise, direct forensic analyst. Not cold. Not warm. Precise.

Always respond with ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "root_cause": "string — 2-3 sentences",
  "cognitive_biases": [{"name":"string","description":"string","severity":"low|medium|high"}],
  "emotional_triggers": [{"trigger":"string","pattern":"string"}],
  "nervous_system_state": "string",
  "life_patterns": [{"pattern":"string","how_it_manifested_here":"string"}],
  "wait_72hr_probability": 0.0-1.0,
  "alternate_outcome_probability": 0.0-1.0,
  "estimated_cost_context": "string — qualitative cost of this pattern (use INR when mentioning money)",
  "immediate_actions": [{"action":"string","why":"string"}],
  "pattern_break_strategy": "string",
  "full_report_markdown": "string — full markdown autopsy"
}`;

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export async function generateAutopsy(
  userInput: string,
  domain: string,
  emotionalState: string,
  pastDecisions: { title: string; raw_input: string; created_at?: string }[],
  cognitiveProfile: Record<string, unknown> | null,
): Promise<{ result: AutopsyResult; tokensApprox: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    systemInstruction: AUTOPSY_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const historySnippet =
    pastDecisions.length > 0
      ? pastDecisions
          .slice(0, 10)
          .map(
            (d, i) =>
              `${i + 1}. ${d.title}: ${d.raw_input.slice(0, 400)}${d.raw_input.length > 400 ? "…" : ""}`,
          )
          .join("\n")
      : "None yet.";

  const profileSnippet = cognitiveProfile
    ? JSON.stringify(cognitiveProfile).slice(0, 4000)
    : "None yet.";

  const userPrompt = `Domain: ${domain}
Emotional state when deciding: ${emotionalState}

User's decision narrative:
"""
${userInput}
"""

Past decisions (for pattern context):
${historySnippet}

Existing cognitive profile snapshot:
${profileSnippet}

Return JSON only per the schema. Include estimated rough INR in estimated_cost_context text if relevant.`;

  const result = await model.generateContent(userPrompt);

  const text = result.response.text();
  const parsed = JSON.parse(extractJson(text));
  const validated = AutopsySchema.parse(parsed);

  const usage = result.response.usageMetadata;
  const tokensApprox =
    (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0);

  return { result: validated, tokensApprox };
}
