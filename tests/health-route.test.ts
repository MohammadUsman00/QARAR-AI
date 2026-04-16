import { GET as healthGet } from "@/app/api/health/route";
import { GET as readyGet } from "@/app/api/ready/route";

async function jsonFromResponse(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("health and readiness routes", () => {
  const envBackup = { ...process.env };

  afterEach(() => {
    process.env = { ...envBackup };
  });

  test("health returns fail without required env", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = healthGet();
    expect(res.status).toBe(503);
    const body = await jsonFromResponse(res as unknown as Response);
    expect(body.status).toBe("fail");
  });

  test("readiness passes with required env", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    process.env.GEMINI_API_KEY = "gemini-key";

    const res = readyGet();
    expect(res.status).toBe(200);
    const body = await jsonFromResponse(res as unknown as Response);
    expect(body.ready).toBe(true);
  });
});
