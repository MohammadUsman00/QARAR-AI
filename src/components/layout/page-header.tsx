import { RoyalCrest } from "@/components/royal/royal-crest";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-4">
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-tertiary/50 sm:flex">
          <RoyalCrest size={28} />
        </div>
        <div>
          <p className="font-royal text-[10px] uppercase tracking-[0.35em] text-accent-primary">
            قرار · Royal Suite
          </p>
          <h1 className="mt-1 font-display text-3xl text-text-primary md:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl font-sans text-sm text-text-secondary">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
