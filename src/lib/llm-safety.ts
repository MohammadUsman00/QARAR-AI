import type { AutopsyResult } from "@/lib/gemini";

const HIGH_RISK_ADVICE_PATTERNS = [
  /\b(stop|quit|skip)\s+(taking\s+)?(medication|medicine|therapy|treatment)\b/i,
  /\bguaranteed\s+(profit|return|win)\b/i,
  /\bhide\s+this\s+from\b/i,
  /\bbreak\s+the\s+law\b/i,
  /\bharm\s+(yourself|someone|others)\b/i,
];

const CRISIS_INPUT_PATTERNS = [
  /\b(kill|hurt|harm)\s+myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend\s+my\s+life\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcan't\s+go\s+on\b/i,
  /\bwant\s+to\s+die\b/i,
];

export type CrisisDetection = {
  detected: boolean;
  message: string;
};

export function assertSafeAutopsyOutput(result: AutopsyResult) {
  const adviceText = [
    result.root_cause,
    result.pattern_break_strategy,
    result.full_report_markdown,
    ...result.immediate_actions.flatMap((action) => [action.action, action.why]),
  ].join("\n");

  const unsafePattern = HIGH_RISK_ADVICE_PATTERNS.find((pattern) =>
    pattern.test(adviceText),
  );

  if (unsafePattern) {
    throw new Error(`Unsafe advice pattern detected: ${unsafePattern.source}`);
  }
}

export function detectCrisisInput(input: string): CrisisDetection {
  const detected = CRISIS_INPUT_PATTERNS.some((pattern) => pattern.test(input));
  if (!detected) {
    return { detected: false, message: "" };
  }

  return {
    detected: true,
    message:
      "This sounds urgent and outside what Qarar should analyze. If you might hurt yourself or someone else, contact local emergency services now or reach out to a trusted person immediately. When you are safe, you can return and analyze the decision context.",
  };
}

export function safetyDisclaimer() {
  return "Qarar provides decision-analysis support, not medical, legal, financial, or mental-health advice. For urgent safety, health, legal, or financial decisions, consult a qualified professional.";
}
