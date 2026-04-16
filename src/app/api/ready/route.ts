import { createHealthReport } from "@/lib/health";
import { NextResponse } from "next/server";

export function GET() {
  const report = createHealthReport();
  const requiredChecks = new Set([
    "env:NEXT_PUBLIC_APP_URL",
    "env:NEXT_PUBLIC_SUPABASE_URL",
    "env:NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "env:GEMINI_API_KEY",
  ]);
  const hasRequiredFailure = report.checks.some(
    (check) => requiredChecks.has(check.name) && check.status === "fail",
  );

  return NextResponse.json(
    {
      ready: !hasRequiredFailure,
      timestamp: report.timestamp,
    },
    { status: hasRequiredFailure ? 503 : 200 },
  );
}
