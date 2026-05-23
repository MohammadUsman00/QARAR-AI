"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

type Alert = {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
  decision_id: string | null;
};

export function PatternAlertsPanel({
  initialAlerts,
  plan,
}: {
  initialAlerts: Alert[];
  plan: string;
}) {
  const [alerts, setAlerts] = useState(initialAlerts);

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("pattern_alerts").update({ read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  async function markAllRead() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("pattern_alerts")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-3 text-sm text-text-secondary">
      {plan !== "elite" && (
        <p className="text-text-tertiary">
          Predictive pattern alerts unlock on Elite. You&apos;re on {plan}.
        </p>
      )}
      {alerts.length === 0 && (
        <p>No alerts yet. Recurring biases trigger alerts on Elite.</p>
      )}
      {unread > 0 && (
        <Button variant="ghost" size="sm" onClick={markAllRead}>
          Mark all read ({unread})
        </Button>
      )}
      {alerts.map((al) => (
        <div
          key={al.id}
          className={`rounded-lg border px-3 py-2 ${
            al.read
              ? "border-border-subtle bg-bg-tertiary/20 opacity-70"
              : "border-border-active bg-bg-tertiary/50"
          }`}
        >
          <div className="text-text-primary">{al.message}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <span>{new Date(al.created_at).toLocaleString()}</span>
            {al.decision_id && (
              <Link
                href={`/autopsy?decision=${al.decision_id}`}
                className="text-accent-primary hover:underline"
              >
                View decision
              </Link>
            )}
            {!al.read && (
              <button
                type="button"
                onClick={() => markRead(al.id)}
                className="text-accent-secondary hover:underline"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
