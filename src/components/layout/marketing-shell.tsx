import type { ReactNode } from "react";
import Link from "next/link";
import { RoyalAmbient } from "@/components/royal/royal-ambient";
import { RoyalCrest } from "@/components/royal/royal-crest";
import { Button } from "@/components/ui/button";

export function MarketingShell({
  children,
  showNav = true,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg-primary text-text-primary">
      <RoyalAmbient />
      {showNav && <MarketingNav />}
      <div className="relative z-10">{children}</div>
      <MarketingFooter />
    </div>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle/80 bg-bg-primary/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <RoyalCrest size={28} className="transition-transform group-hover:scale-105" />
          <div>
            <span className="font-royal text-sm uppercase tracking-[0.2em] text-accent-primary">
              Qarar
            </span>
            <span className="ml-2 font-display text-sm italic text-text-tertiary">قرار</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 font-sans text-sm text-text-secondary md:flex">
          <Link href="/#how" className="transition-colors hover:text-accent-secondary">
            How it works
          </Link>
          <Link href="/#features" className="transition-colors hover:text-accent-secondary">
            Features
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-accent-secondary">
            Pricing
          </Link>
          <Link href="/about" className="transition-colors hover:text-accent-secondary">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="royal-btn-shine">
            <Link href="/signup">Begin free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-border-subtle px-4 py-12 text-center">
      <div className="royal-divider mx-auto mb-8 max-w-md" />
      <div className="flex flex-wrap items-center justify-center gap-8 font-sans text-sm text-text-secondary">
        <Link href="/about" className="hover:text-accent-primary">
          About
        </Link>
        <Link href="/pricing" className="hover:text-accent-primary">
          Pricing
        </Link>
        <a href="mailto:hello@qarar.app" className="hover:text-accent-primary">
          Contact
        </a>
      </div>
      <p className="mt-8 font-display text-sm italic text-text-tertiary">
        Royal decision intelligence — forensic clarity, not comfort.
      </p>
    </footer>
  );
}
