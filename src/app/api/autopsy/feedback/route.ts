import {
  autopsyFeedbackSchema,
  formatZodError,
} from "@/lib/api-validation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  let input;
  try {
    input = autopsyFeedbackSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "validation_error", details: formatZodError(error) },
        { status: 400 },
      );
    }
    throw error;
  }

  const { data: autopsy } = await supabase
    .from("autopsies")
    .select("id, user_id")
    .eq("id", input.autopsy_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!autopsy) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { error } = await supabase.from("autopsy_feedback").upsert(
    {
      autopsy_id: input.autopsy_id,
      user_id: user.id,
      helpful: input.helpful,
      tags: input.tags,
      comment: input.comment ?? null,
    },
    { onConflict: "autopsy_id,user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
