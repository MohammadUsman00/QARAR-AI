"use client";

import { DemoTypewriter } from "@/components/marketing/demo-typewriter";
import { Particles } from "@/components/marketing/particles";
import { RoyalHeroFrame } from "@/components/marketing/royal-hero-frame";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { RoyalCard } from "@/components/royal/royal-card";
import { RoyalCrest } from "@/components/royal/royal-crest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, ChevronDown, Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "72h", label: "Impulse window modeled" },
  { value: "6", label: "Life domains scored" },
  { value: "AI", label: "Pipeline with memory" },
];

const problems = [
  "Therapy costs ₹12,000/hour. 6-month waitlist.",
  "Self-help books are written for someone else.",
  "Friends are biased. You already know what they'll say.",
];

const steps = [
  {
    title: "Tell Qarar what happened",
    body: "Natural language — like texting a friend who remembers everything.",
  },
  {
    title: "Qarar runs the autopsy",
    body: "Gemini-powered analysis maps biases, triggers, and recurring patterns.",
  },
  {
    title: "Understand yourself permanently",
    body: "Your cognitive profile sharpens with every decision you dissect.",
  },
];

const features = [
  "Decision Autopsy",
  "Pattern Detection",
  "Cognitive Profile",
  "Domain Scoring",
  "72-Hour Simulator",
  "Cost Calculator",
];

export default function LandingPage() {
  return (
    <MarketingShell>
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20">
        <Particles />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl"
        >
          <RoyalHeroFrame>
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-royal-deep/50"
              >
                <RoyalCrest size={40} />
              </motion.div>
              <p className="font-royal text-xs uppercase tracking-[0.45em] text-accent-primary">
                Royal Decision Intelligence
              </p>
              <p className="mt-2 font-display text-xl italic text-accent-royal/90">قرار</p>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-text-primary sm:text-5xl md:text-6xl">
                See your decisions
                <br />
                <span className="bg-gradient-to-r from-accent-secondary via-accent-primary to-accent-royal bg-clip-text text-transparent">
                  with royal clarity
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-sans text-lg text-text-secondary">
                Not therapy. Not journaling. A forensic autopsy of why you made the decision you
                regret — powered by a full AI pipeline with memory.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="royal-btn-shine w-full sm:w-auto">
                  <Link href="/signup">
                    <Crown className="h-4 w-4" />
                    Begin Your First Autopsy
                  </Link>
                </Button>
                <Button asChild variant="royal" size="lg" className="w-full sm:w-auto">
                  <Link href="#how">Explore the suite</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-text-tertiary">
                Free for your first 3 autopsies · No credit card
              </p>
            </div>
          </RoyalHeroFrame>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <RoyalCard className="text-center">
                  <div className="royal-card-inner px-4 py-5">
                    <div className="font-display text-2xl text-accent-primary md:text-3xl">
                      {s.value}
                    </div>
                    <div className="mt-1 font-royal text-[9px] uppercase tracking-wider text-text-tertiary">
                      {s.label}
                    </div>
                  </div>
                </RoyalCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-accent-primary/50"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      <section className="border-t border-border-subtle bg-bg-secondary/40 px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-border-subtle bg-bg-tertiary/40">
                <CardContent className="p-6 text-sm leading-relaxed text-text-secondary">
                  {p}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-14 max-w-3xl text-center font-display text-2xl text-text-primary md:text-3xl">
          You&apos;ve made this mistake before.
          <br />
          You&apos;ll make it again.
          <br />
          <span className="text-accent-primary">Unless something changes.</span>
        </p>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl text-text-primary md:text-4xl">
            Watch an autopsy unfold
          </h2>
          <p className="mt-3 text-text-secondary">
            Terminal-beautiful output — structured, clinical, unforgettable.
          </p>
          <div className="mt-10">
            <DemoTypewriter />
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border-subtle bg-bg-secondary/30 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl text-text-primary md:text-4xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <RoyalCard glow={i === 1}>
                  <div className="royal-card-inner p-6">
                    <div className="font-royal text-xs text-accent-royal">
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-3 font-display text-xl text-text-primary">{s.title}</h3>
                    <p className="mt-2 font-sans text-sm text-text-secondary">{s.body}</p>
                  </div>
                </RoyalCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-royal text-[10px] uppercase tracking-[0.35em] text-accent-royal">
            Royal suite
          </p>
          <h2 className="mt-2 font-display text-3xl text-text-primary md:text-4xl">
            Everything a decision mind needs
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <RoyalCard glow={i === 0}>
                <div className="royal-card-inner flex gap-3 p-5">
                  {i % 3 === 0 ? (
                    <Sparkles className="h-5 w-5 shrink-0 text-accent-primary" />
                  ) : i % 3 === 1 ? (
                    <Zap className="h-5 w-5 shrink-0 text-accent-royal" />
                  ) : (
                    <Check className="h-5 w-5 shrink-0 text-accent-success" />
                  )}
                  <div>
                    <div className="font-display text-lg text-text-primary">{f}</div>
                    <p className="mt-1 font-sans text-sm text-text-secondary">
                      Precision metrics and narrative, not vague advice.
                    </p>
                  </div>
                </div>
              </RoyalCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-border-subtle bg-bg-secondary/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl text-text-primary md:text-4xl">
            Pricing
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "₹0",
                perks: ["3 autopsies lifetime", "Basic cognitive profile", "30-day history"],
              },
              {
                name: "Pro",
                price: "₹999/mo",
                perks: [
                  "Unlimited autopsies",
                  "Full patterns + PDF export",
                  "Forever history",
                ],
                popular: true,
              },
              {
                name: "Elite",
                price: "₹4,999/mo",
                perks: [
                  "Everything in Pro",
                  "Predictive pattern alerts",
                  "Priority model routing",
                ],
              },
            ].map((tier) => (
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
                  <Button asChild className="mt-8 w-full royal-btn-shine" variant={tier.popular ? "default" : "outline"}>
                    <Link href="/signup">Start free</Link>
                  </Button>
                </div>
              </RoyalCard>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-text-tertiary">
            Annual billing saves ~30% — configure Stripe price IDs when you upgrade from the free
            build.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "I realized I've left 3 jobs, all within 2 weeks of feeling disrespected by a senior. Qarar saw it in 20 minutes.",
              by: "Founder, Bangalore",
            },
            {
              quote:
                "The report felt like an intelligence brief on my own blind spots — uncomfortable and clarifying.",
              by: "PM, Mumbai",
            },
            {
              quote:
                "Finally a tool that doesn't moralize. It dissects. That's what I needed.",
              by: "Designer, Delhi",
            },
          ].map((t) => (
            <Card key={t.by} className="border-border-subtle bg-bg-secondary/60">
              <CardContent className="p-6 text-sm italic text-text-secondary">
                “{t.quote}”
                <div className="mt-4 text-xs not-italic text-text-tertiary">
                  Illustrative testimonial — {t.by}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border-subtle bg-bg-primary px-4 py-24 text-center">
        <blockquote className="mx-auto max-w-3xl font-display text-2xl italic leading-relaxed text-text-primary md:text-3xl">
          &ldquo;We built telescopes to see galaxies. We built microscopes to see atoms. Qarar is the
          first tool to see yourself.&rdquo;
        </blockquote>
        <Button asChild size="lg" className="royal-btn-shine mt-10">
          <Link href="/signup">
            <Crown className="h-4 w-4" />
            Begin Your First Autopsy
          </Link>
        </Button>
      </section>

      <p className="border-t border-border-subtle py-8 text-center text-xs text-text-tertiary">
        Made with obsession in Kashmir
      </p>
    </MarketingShell>
  );
}
