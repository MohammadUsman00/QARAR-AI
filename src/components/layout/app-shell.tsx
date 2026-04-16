"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  History,
  Home,
  LineChart,
  Settings,
  Sparkles,
} from "lucide-react";
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
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border-subtle bg-bg-secondary/50 px-4 py-6 md:flex">
        <Link href="/dashboard" className="mb-10 flex items-center gap-2 px-2">
          <Brain className="h-7 w-7 text-accent-primary" />
          <div className="font-display text-xl tracking-tight text-text-primary">
            Qarar <span className="text-accent-primary">قرار</span>
          </div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.span
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-bg-tertiary text-accent-primary shadow-glowGold"
                      : "text-text-secondary hover:bg-bg-tertiary/60 hover:text-text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 rounded-xl border border-border-subtle bg-bg-tertiary/40 p-3">
          <div className="text-xs text-text-secondary truncate">{userEmail}</div>
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-primary">
              {plan}
            </span>
            <Link
              href="/upgrade"
              className="text-xs font-medium text-accent-secondary hover:underline"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border-subtle bg-bg-secondary/95 px-2 py-2 backdrop-blur md:hidden">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium",
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
