"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { History, Home, LineChart, Settings, Sparkles } from "lucide-react";
import { RoyalCrest } from "@/components/royal/royal-crest";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/autopsy", label: "New", icon: Sparkles },
  { href: "/history", label: "History", icon: History },
  { href: "/patterns", label: "Patterns", icon: LineChart },
  { href: "/profile", label: "Profile", icon: Settings },
];

export function AppShell({
  children,
  userEmail,
  plan,
}: {
  children: React.ReactNode;
  userEmail: string;
  plan: string;
}) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row">
      <div className="pointer-events-none fixed inset-0 qarar-gradient-bg opacity-40 md:hidden" aria-hidden />
      <aside className="relative hidden w-64 flex-shrink-0 flex-col border-r border-border-subtle/80 bg-bg-secondary/90 px-4 py-6 backdrop-blur-xl md:flex">
        <div className="pointer-events-none absolute inset-0 qarar-gradient-bg opacity-70" aria-hidden />
        <Link href="/dashboard" className="relative z-10 mb-10 flex items-center gap-3 px-2">
          <RoyalCrest size={32} />
          <div>
            <div className="font-royal text-sm uppercase tracking-[0.12em] text-accent-primary">
              Qarar
            </div>
            <div className="font-display text-sm italic text-text-tertiary">قرار</div>
          </div>
        </Link>
        <nav className="relative z-10 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.span
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 font-sans text-sm transition-all",
                    active
                      ? "border border-border-active/50 bg-royal-deep/60 text-accent-secondary shadow-glowRoyal"
                      : "text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-accent-primary")} />
                  <span className={active ? "font-medium" : ""}>{item.label}</span>
                </motion.span>
              </Link>
            );
          })}
        </nav>
        <div className="royal-card relative z-10 mt-auto">
          <div className="royal-card-inner space-y-3 p-3">
            <div className="truncate font-sans text-xs text-text-secondary">{userEmail}</div>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full border border-accent-royal/30 bg-royal-deep/50 px-2 py-0.5 font-royal text-[9px] uppercase tracking-wider text-accent-primary">
                {plan}
              </span>
              <Link
                href="/upgrade"
                className="font-sans text-xs text-accent-secondary hover:underline"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border-subtle/80 bg-bg-secondary/95 px-2 py-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 font-sans text-[10px]",
                active ? "text-accent-primary" : "text-text-secondary",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
