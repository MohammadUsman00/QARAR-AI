import type { AutopsyResult } from "@/lib/gemini";

const HIGH_RISK_ADVICE_PATTERNS = [
  /\b(stop|quit|skip)\s+(taking\s+)?(medication|medicine|therapy|treatment)\b/i,
  /\bguaranteed\s+(profit|return|win)\b/i,
  /\bhide\s+this\s+from\b/i,
  /\bbreak\s+the\s+law\b/i,
  /\bharm\s+(yourself|someone|others)\b/i,
];

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

export function safetyDisclaimer() {
  return "Qarar provides decision-analysis support, not medical, legal, financial, or mental-health advice. For urgent safety, health, legal, or financial decisions, consult a qualified professional.";
}
