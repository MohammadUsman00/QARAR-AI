export type HealthLevel = "pass" | "warn" | "fail";

export type HealthCheck = {
  name: string;
  status: HealthLevel;
  details?: string;
};

export type HealthReport = {
  service: string;
  status: HealthLevel;
  timestamp: string;
  uptime_seconds: number;
  version: string;
  checks: HealthCheck[];
};

function aggregateStatus(checks: HealthCheck[]): HealthLevel {
  if (checks.some((c) => c.status === "fail")) return "fail";
  if (checks.some((c) => c.status === "warn")) return "warn";
  return "pass";
}

export function createHealthReport(): HealthReport {
  const requiredEnv = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "GEMINI_API_KEY",
  ];

  const optionalEnv = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RESEND_API_KEY",
  ];

  const checks: HealthCheck[] = [
    {
      name: "node_runtime",
      status: "pass",
      details: process.version,
    },
  ];

  for (const key of requiredEnv) {
    checks.push({
      name: `env:${key}`,
      status: process.env[key] ? "pass" : "fail",
      details: process.env[key] ? "present" : "missing",
    });
  }

  for (const key of optionalEnv) {
    checks.push({
      name: `env:${key}`,
      status: process.env[key] ? "pass" : "warn",
      details: process.env[key] ? "present" : "not configured (optional)",
    });
  }

  const status = aggregateStatus(checks);

  return {
    service: "qarar-ai-web",
    status,
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    version: process.env.npm_package_version ?? "unknown",
    checks,
  };
}
