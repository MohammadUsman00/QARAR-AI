import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    perks: ["3 autopsies lifetime", "Basic cognitive profile", "30-day history"],
  },
  {
    name: "Pro",
    price: "₹999/mo",
    popular: true,
    perks: ["Unlimited autopsies", "Full patterns + PDF export", "Forever history"],
  },
  {
    name: "Elite",
    price: "₹4,999/mo",
    perks: ["Everything in Pro", "Predictive pattern alerts", "Priority inference"],
  },
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <p className="font-display text-lg italic tracking-[0.35em] text-accent-primary">
            PRICING
          </p>
          <h1 className="mt-4 font-heading text-4xl text-text-primary md:text-5xl">
            Invest in decision clarity
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Start free. Upgrade when patterns matter more than single autopsies.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`qarar-surface relative p-6 ${
                tier.popular ? "border-border-active shadow-glowGold" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-bg-primary">
                  Most popular
                </span>
              )}
              <div className="font-heading text-xl text-text-primary">{tier.name}</div>
              <div className="mt-4 font-heading text-3xl text-accent-primary">{tier.price}</div>
              <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                {tier.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 w-full">
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-text-tertiary">
          <Link href="/" className="text-accent-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>
    </MarketingShell>
  );
}
