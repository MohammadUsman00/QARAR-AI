import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId, plan = "pro" } = (await request.json()) as {
    priceId?: string;
    plan?: "pro" | "elite";
  };
  if (!priceId) {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await createCheckoutSession({
    priceId,
    plan,
    customerId: profile?.stripe_customer_id ?? null,
    successUrl: `${appUrl}/upgrade?success=1`,
    cancelUrl: `${appUrl}/upgrade`,
    clientReferenceId: user.id,
  });

  if (!session) {
    return NextResponse.json(
      {
        error: "stripe_not_configured",
        message:
          "Stripe is optional in the free build. Add STRIPE_SECRET_KEY and price IDs.",
      },
      { status: 501 },
    );
  }

  return NextResponse.json({ url: session.url });
}
