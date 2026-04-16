import { createHealthReport } from "@/lib/health";

describe("health report", () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  test("fails when required env vars are missing", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.GEMINI_API_KEY;

    const report = createHealthReport();
    expect(report.status).toBe("fail");
  });

  test("passes required checks when configured", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.GEMINI_API_KEY = "gemini-key";

    const report = createHealthReport();
    const required = report.checks.filter((c) =>
      [
        "env:NEXT_PUBLIC_APP_URL",
        "env:NEXT_PUBLIC_SUPABASE_URL",
        "env:NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "env:GEMINI_API_KEY",
      ].includes(c.name),
    );
    expect(required.every((c) => c.status === "pass")).toBe(true);
  });
});
