import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 501 });
  }

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();

  if (!sig) {
    return NextResponse.json({ error: "no signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceRoleClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.client_reference_id;
    if (uid) {
      const plan =
        session.metadata?.plan === "elite"
          ? "elite"
          : session.metadata?.plan === "pro"
            ? "pro"
            : "pro";
      await supabase
        .from("user_profiles")
        .update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", uid);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const metaPlan = sub.metadata?.plan;
    const planFromMeta =
      metaPlan === "elite" ? "elite" : metaPlan === "pro" ? "pro" : null;
    const { data: row } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    if (row?.id) {
      const active = sub.status === "active" || sub.status === "trialing";
      const plan = !active
        ? "free"
        : planFromMeta ?? "pro";
      await supabase
        .from("user_profiles")
        .update({
          plan,
          stripe_subscription_id: active ? sub.id : null,
        })
        .eq("id", row.id);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    let email = invoice.customer_email ?? null;
    if (!email && typeof invoice.customer === "string") {
      try {
        const cust = await stripe.customers.retrieve(invoice.customer);
        if (!cust.deleted && "email" in cust && cust.email) {
          email = cust.email;
        }
      } catch {
        // ignore — optional enrichment
      }
    }
    if (email) {
      const { sendPaymentFailedNotice } = await import("@/lib/email");
      await sendPaymentFailedNotice({
        to: email,
        invoiceId: invoice.id ?? undefined,
      });
    }
  }

  return NextResponse.json({ received: true });
}
