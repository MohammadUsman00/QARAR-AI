"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
const ELITE = process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY;

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    priceId: undefined as string | undefined,
    plan: undefined as "pro" | "elite" | undefined,
    perks: ["3 autopsies lifetime", "Basic profile", "30-day history"],
  },
  {
    name: "Pro",
    price: "₹999/mo",
    popular: true,
    priceId: PRO,
    plan: "pro" as const,
    perks: ["Unlimited autopsies", "Patterns + PDF", "Forever history"],
  },
  {
    name: "Elite",
    price: "₹4,999/mo",
    priceId: ELITE,
    plan: "elite" as const,
    perks: ["Everything in Pro", "Predictive alerts", "Priority routing"],
  },
];

export default function UpgradePage() {
  const [plan, setPlan] = useState("free");
  const [note, setNote] = useState<string | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("plan, stripe_customer_id")
        .eq("id", user.id)
        .single();
      setPlan(data?.plan ?? "free");
      setStripeCustomerId(data?.stripe_customer_id ?? null);
    });
  }, []);

  async function openBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (json.url) window.location.href = json.url as string;
    else setNote(json.message ?? json.error ?? "Billing portal unavailable.");
  }

  async function checkout(priceId?: string, plan?: "pro" | "elite") {
    setNote(null);
    if (!priceId || !plan) {
      setNote("Set Stripe price IDs in .env to enable checkout (free build).");
      return;
    }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, plan }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setNote(json.message ?? json.error ?? "Checkout unavailable");
      return;
    }
    if (json.url) window.location.href = json.url as string;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl text-text-primary">Upgrade</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Current plan: <span className="text-accent-primary">{plan}</span>
          </p>
        </div>
        {stripeCustomerId && (
          <Button variant="outline" onClick={openBillingPortal}>
            Manage billing
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border p-6 ${
              tier.popular
                ? "border-border-active bg-bg-tertiary/60 shadow-glowGold"
                : "border-border-subtle bg-bg-secondary/40"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-bg-primary">
                Most popular
              </span>
            )}
            <div className="font-heading text-xl text-text-primary">{tier.name}</div>
            <div className="mt-3 font-heading text-3xl text-accent-primary">{tier.price}</div>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {tier.perks.map((p) => (
                <li key={p} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-accent-success" />
                  {p}
                </li>
              ))}
            </ul>
            <Button
              className="mt-8 w-full"
              variant={tier.name === "Free" ? "outline" : "default"}
              disabled={tier.name === "Free"}
              onClick={() => checkout(tier.priceId, tier.plan)}
            >
              {tier.name === "Free" ? "Included" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>

      {note && <p className="text-sm text-accent-danger">{note}</p>}

      <div className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-4 text-sm text-text-secondary">
        <div className="font-heading text-text-primary">FAQ</div>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Stripe keys are optional in the free build — add them when you are ready to bill.</li>
          <li>Use customer portal + webhooks to sync plans to `user_profiles`.</li>
        </ul>
      </div>
    </div>
  );
}
