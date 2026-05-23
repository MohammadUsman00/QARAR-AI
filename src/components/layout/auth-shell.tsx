import type { ReactNode } from "react";
import Link from "next/link";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-bg-primary p-10 md:flex">
        <div className="pointer-events-none absolute inset-0 qarar-gradient-bg" aria-hidden />
        <Link
          href="/"
          className="relative z-10 font-display text-2xl italic text-accent-primary hover:text-accent-secondary"
        >
          Qarar — قرار
        </Link>
        <blockquote className="relative z-10 max-w-sm font-display text-xl italic leading-relaxed text-text-primary">
          &ldquo;The first tool built to see your decision patterns with forensic clarity.&rdquo;
        </blockquote>
        <p className="relative z-10 text-sm text-text-secondary">
          Not therapy. Not journaling. Structured autopsy of the decisions you regret.
        </p>
      </div>
      <div className="relative flex flex-col justify-center bg-bg-primary px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(107,140,255,0.08),_transparent_50%)] md:hidden" />
        <div className="relative z-10 mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-block font-display text-lg italic text-accent-primary md:hidden"
          >
            Qarar — قرار
          </Link>
          <h1 className="font-heading text-3xl text-text-primary">{title}</h1>
          <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
