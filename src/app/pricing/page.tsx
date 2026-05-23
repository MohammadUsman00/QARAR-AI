import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { RoyalCard } from "@/components/royal/royal-card";
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
          <p className="font-royal text-[10px] uppercase tracking-[0.4em] text-accent-royal">
            Royal tiers
          </p>
          <h1 className="mt-4 font-display text-4xl text-text-primary md:text-5xl">
            Invest in decision clarity
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-sans text-text-secondary">
            Start free. Upgrade when patterns matter more than single autopsies.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <RoyalCard key={tier.name} glow={tier.popular}>
              <div className="royal-card-inner relative p-6">
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-primary to-accent-royal px-3 py-1 font-royal text-[10px] uppercase tracking-wider text-bg-primary">
                    Most popular
                  </span>
                )}
                <div className="font-royal text-sm uppercase tracking-wider text-text-primary">
                  {tier.name}
                </div>
                <div className="mt-4 font-display text-3xl text-accent-primary">{tier.price}</div>
                <ul className="mt-6 space-y-2 font-sans text-sm text-text-secondary">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-success" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full royal-btn-shine"
                  variant={tier.popular ? "default" : "outline"}
                >
                  <Link href="/signup">Start free</Link>
                </Button>
              </div>
            </RoyalCard>
          ))}
        </div>
        <p className="mt-10 text-center font-sans text-sm text-text-tertiary">
          <Link href="/" className="text-accent-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </section>
    </MarketingShell>
  );
}
