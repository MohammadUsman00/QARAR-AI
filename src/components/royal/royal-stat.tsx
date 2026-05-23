import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function RoyalStat({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down";
  className?: string;
}) {
  return (
    <div className={cn("royal-card royal-card-glow p-5", className)}>
      <div className="royal-card-inner flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="font-royal text-[10px] uppercase tracking-[0.25em] text-accent-primary/80">
            {label}
          </span>
          {Icon && (
            <Icon className="h-4 w-4 shrink-0 text-accent-royal/70" strokeWidth={1.5} />
          )}
        </div>
        <div className="mt-3">
          <div className="font-display text-3xl font-semibold text-text-primary">{value}</div>
          {hint && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend === "up" && "text-accent-success",
                trend === "down" && "text-accent-danger",
                !trend && "text-text-tertiary",
              )}
            >
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
