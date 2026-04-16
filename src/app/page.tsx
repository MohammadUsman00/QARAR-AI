"use client";

import { DemoTypewriter } from "@/components/marketing/demo-typewriter";
import { Particles } from "@/components/marketing/particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

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
    <div className="relative overflow-x-hidden bg-bg-primary">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(107,140,255,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(200,169,81,0.12),_transparent_50%)]" />
        <Particles />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative z-10 max-w-4xl text-center"
        >
          <p className="font-display text-lg italic tracking-[0.35em] text-accent-primary">
            QARAR — قرار
          </p>
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            The world finally has a tool
            <br />
            to see yourself clearly.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Not therapy. Not journaling. Not self-help.
            <br />A forensic autopsy of why you made the decision you regret.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Begin Your First Autopsy</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <Link href="#how">See How It Works</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-text-tertiary">
            Free for your first 3 autopsies. No credit card.
          </p>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-tertiary"
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
        <p className="mx-auto mt-14 max-w-3xl text-center font-heading text-2xl text-text-primary md:text-3xl">
          You&apos;ve made this mistake before.
          <br />
          You&apos;ll make it again.
          <br />
          <span className="text-accent-primary">Unless something changes.</span>
        </p>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-heading text-3xl text-text-primary md:text-4xl">
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
          <h2 className="text-center font-heading text-3xl text-text-primary md:text-4xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border-subtle bg-bg-tertiary/30 p-6"
              >
                <div className="font-mono text-xs text-accent-neural">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-heading text-lg text-text-primary">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-5"
            >
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-success" />
                <div>
                  <div className="font-heading text-lg text-text-primary">{f}</div>
                  <p className="mt-1 text-sm text-text-secondary">
                    Precision metrics and narrative, not vague advice.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-t border-border-subtle bg-bg-secondary/40 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl text-text-primary md:text-4xl">
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
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-6 ${
                  tier.popular
                    ? "border-border-active bg-bg-tertiary/60 shadow-glowGold"
                    : "border-border-subtle bg-bg-tertiary/30"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-bg-primary">
                    Most popular
                  </span>
                )}
                <div className="font-heading text-xl text-text-primary">
                  {tier.name}
                </div>
                <div className="mt-4 font-heading text-3xl text-accent-primary">
                  {tier.price}
                </div>
                <ul className="mt-6 space-y-2 text-sm text-text-secondary">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-accent-success" />
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
        <Button asChild size="lg" className="mt-10">
          <Link href="/signup">Begin Your First Autopsy</Link>
        </Button>
      </section>

      <footer className="border-t border-border-subtle px-4 py-10 text-center text-sm text-text-tertiary">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/about" className="hover:text-text-secondary">
            Privacy
          </Link>
          <Link href="/about" className="hover:text-text-secondary">
            Terms
          </Link>
          <a href="mailto:hello@qarar.app" className="hover:text-text-secondary">
            Contact
          </a>
        </div>
        <p className="mt-6">Made with obsession in Kashmir 🏔️</p>
      </footer>
    </div>
  );
}
