export type PlanId = "free" | "pro" | "elite";

export const PLAN_LIMITS: Record<
  PlanId,
  {
    autopsies_lifetime: number;
    history_days: number;
    patterns_access: boolean;
    pdf_export: boolean;
    pattern_alerts: boolean;
    cognitive_profile: "basic" | "full";
    predictive_alerts?: boolean;
  }
> = {
  free: {
    autopsies_lifetime: 3,
    history_days: 30,
    patterns_access: false,
    pdf_export: false,
    pattern_alerts: false,
    cognitive_profile: "basic",
  },
  pro: {
    autopsies_lifetime: Number.POSITIVE_INFINITY,
    history_days: Number.POSITIVE_INFINITY,
    patterns_access: true,
    pdf_export: true,
    pattern_alerts: false,
    cognitive_profile: "full",
  },
  elite: {
    autopsies_lifetime: Number.POSITIVE_INFINITY,
    history_days: Number.POSITIVE_INFINITY,
    patterns_access: true,
    pdf_export: true,
    pattern_alerts: true,
    cognitive_profile: "full",
    predictive_alerts: true,
  },
};

export function getPlanLimits(plan: string | null | undefined) {
  const p = (plan as PlanId) || "free";
  return PLAN_LIMITS[p] ?? PLAN_LIMITS.free;
}
