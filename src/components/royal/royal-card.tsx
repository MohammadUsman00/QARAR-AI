import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function RoyalCard({
  children,
  className,
  glow = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        "royal-card relative overflow-hidden rounded-2xl",
        glow && "royal-card-glow",
        className,
      )}
    >
      <div className="royal-card-inner h-full">{children}</div>
    </div>
  );
}
