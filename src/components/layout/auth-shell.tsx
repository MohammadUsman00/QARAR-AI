import type { ReactNode } from "react";
import Link from "next/link";
import { RoyalAmbient } from "@/components/royal/royal-ambient";
import { RoyalCrest } from "@/components/royal/royal-crest";
import { RoyalCard } from "@/components/royal/royal-card";

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
    <div className="relative grid min-h-screen md:grid-cols-2">
      <RoyalAmbient />
      <div className="relative hidden flex-col justify-between p-10 md:flex">
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <RoyalCrest size={36} />
          <span className="font-royal text-lg uppercase tracking-[0.15em] text-accent-primary">
            Qarar
          </span>
        </Link>
        <RoyalCard glow className="relative z-10 max-w-md">
          <div className="royal-card-inner p-8">
            <blockquote className="font-display text-2xl italic leading-relaxed text-text-primary">
              &ldquo;The crown jewel of decision intelligence — see your patterns with royal
              clarity.&rdquo;
            </blockquote>
            <p className="mt-6 font-sans text-sm text-text-secondary">
              Forensic autopsies. Longitudinal cognitive profiling. Premium pattern intelligence.
            </p>
          </div>
        </RoyalCard>
        <p className="relative z-10 font-royal text-[10px] uppercase tracking-[0.3em] text-text-tertiary">
          Not therapy · Precision
        </p>
      </div>
      <div className="relative flex flex-col justify-center px-6 py-12">
        <div className="relative z-10 mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 md:hidden"
          >
            <RoyalCrest size={24} />
            <span className="font-royal text-sm uppercase tracking-wider text-accent-primary">
              Qarar
            </span>
          </Link>
          <p className="font-royal text-[10px] uppercase tracking-[0.35em] text-accent-royal">
            Royal access
          </p>
          <h1 className="mt-2 font-display text-3xl text-text-primary">{title}</h1>
          <p className="mt-2 font-sans text-sm text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
