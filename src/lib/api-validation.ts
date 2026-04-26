import { z } from "zod";

export const decisionDomainSchema = z.enum([
  "career",
  "relationship",
  "financial",
  "health",
  "social",
  "other",
]);

export const autopsyAnalyzeRequestSchema = z.object({
  raw_input: z
    .string()
    .trim()
    .min(20, "raw_input must describe the decision in at least 20 characters")
    .max(8000, "raw_input is too long"),
  domain: decisionDomainSchema.default("other"),
  emotional_state: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .optional()
    .transform((value) => value ?? "Uncertain"),
  decision_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "decision_date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  outcome_rating: z.coerce.number().int().min(1).max(10).optional().nullable(),
});

export type AutopsyAnalyzeRequest = z.infer<typeof autopsyAnalyzeRequestSchema>;

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
