import { createHealthReport } from "@/lib/health";
import { NextResponse } from "next/server";

export function GET() {
  const report = createHealthReport();
  const code = report.status === "fail" ? 503 : 200;
  return NextResponse.json(report, { status: code });
}
