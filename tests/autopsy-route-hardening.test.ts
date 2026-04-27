import { POST } from "@/app/api/autopsy/analyze/route";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/profile", () => ({
  ensureUserProfile: vi.fn(),
}));

vi.mock("@/lib/gemini", () => ({
  GeminiInferenceError: class GeminiInferenceError extends Error {
    constructor(
      message: string,
      public readonly code: "provider_error" | "parse_error" | "timeout",
    ) {
      super(message);
    }
  },
  generateAutopsy: vi.fn(),
}));

function mockSupabase(user: { id: string; user_metadata?: Record<string, unknown> } | null) {
  vi.mocked(createClient).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  } as never);
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/autopsy/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `127.0.0.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify(body),
  });
}

describe("autopsy route hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns 401 when unauthenticated", async () => {
    mockSupabase(null);

    const res = await POST(jsonRequest({ raw_input: "A valid enough decision story." }));

    expect(res.status).toBe(401);
  });

  test("returns 400 for invalid request payloads", async () => {
    mockSupabase({ id: "user-1", user_metadata: {} });

    const res = await POST(jsonRequest({ raw_input: "too short", domain: "career" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("validation_error");
  });

  test("blocks crisis content before calling the model", async () => {
    mockSupabase({ id: "user-2", user_metadata: {} });

    const res = await POST(
      jsonRequest({
        raw_input:
          "I want to die tonight and need to review the decision that led to this.",
        domain: "other",
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBe("crisis_detected");
  });
});
