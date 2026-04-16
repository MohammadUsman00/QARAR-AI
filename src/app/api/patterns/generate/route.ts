import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cog } = await supabase
    .from("cognitive_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("decisions")
    .select("title, domain, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  });

  const prompt = `Write a 3-4 paragraph letter titled "Your Decision Portrait" for Qarar users.
Tone: forensic, precise, not therapy. Address the reader as "you".
Data snapshot:
${JSON.stringify({ cognitive: cog, recent_decisions: recent }).slice(0, 6000)}`;

  const out = await model.generateContent(prompt);
  const text = out.response.text();

  await supabase
    .from("cognitive_profiles")
    .upsert(
      {
        user_id: user.id,
        narrative_summary: text,
        last_updated: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  return NextResponse.json({ narrative: text });
}
