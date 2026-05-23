import type { ReactNode } from "react";
import Link from "next/link";
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
      <div className="pointer-events-none fixed inset-0 qarar-gradient-bg" aria-hidden />
      {showNav && <MarketingNav />}
      <div className="relative z-10">{children}</div>
      <MarketingFooter />
    </div>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-xl italic tracking-wide text-accent-primary transition-colors group-hover:text-accent-secondary">
            Qarar
          </span>
          <span className="font-display text-lg text-text-tertiary">قرار</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-text-secondary md:flex">
          <Link href="/#how" className="hover:text-text-primary">
            How it works
          </Link>
          <Link href="/#pricing" className="hover:text-text-primary">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-text-primary">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-border-subtle px-4 py-10 text-center text-sm text-text-tertiary">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link href="/about" className="hover:text-text-secondary">
          About
        </Link>
        <Link href="/pricing" className="hover:text-text-secondary">
          Pricing
        </Link>
        <a href="mailto:hello@qarar.app" className="hover:text-text-secondary">
          Contact
        </a>
      </div>
      <p className="mt-6 font-display text-xs italic text-text-tertiary">
        Decision intelligence — forensic, not therapeutic.
      </p>
    </footer>
  );
}
