import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "no_customer", message: "Subscribe once to manage billing." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await createBillingPortalSession({
    customerId: profile.stripe_customer_id,
    returnUrl: `${appUrl}/profile`,
  });

  if (!session) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 501 });
  }

  return NextResponse.json({ url: session.url });
}
