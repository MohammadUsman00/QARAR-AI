"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type NotifSettings = {
  pattern_alerts: boolean;
  weekly_digest: boolean;
  monthly_profile: boolean;
};

const defaultNotif: NotifSettings = {
  pattern_alerts: true,
  weekly_digest: false,
  monthly_profile: true,
};

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [plan, setPlan] = useState("free");
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [notif, setNotif] = useState<NotifSettings>(defaultNotif);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? "");
    const { data } = await supabase
      .from("user_profiles")
      .select(
        "full_name, timezone, plan, stripe_customer_id, notification_settings",
      )
      .eq("id", user.id)
      .single();
    setName(data?.full_name ?? "");
    setTz(data?.timezone ?? "Asia/Kolkata");
    setPlan(data?.plan ?? "free");
    setStripeCustomerId(data?.stripe_customer_id ?? null);
    const raw = data?.notification_settings as NotifSettings | null;
    if (raw) setNotif({ ...defaultNotif, ...raw });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveAccount() {
    setMsg(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("user_profiles")
      .update({ full_name: name, timezone: tz })
      .eq("id", user.id);
    setMsg(error ? error.message : "Saved.");
  }

  async function saveNotifications() {
    setMsg(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("user_profiles")
      .update({ notification_settings: notif })
      .eq("id", user.id);
    setMsg(error ? error.message : "Notification preferences saved.");
  }

  async function openBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (json.url) window.location.href = json.url as string;
    else setMsg(json.message ?? json.error ?? "Billing portal unavailable.");
  }

  async function exportData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: decisions } = await supabase
      .from("decisions")
      .select("*")
      .eq("user_id", user.id);
    const { data: autopsies } = await supabase
      .from("autopsies")
      .select("*")
      .eq("user_id", user.id);
    const blob = new Blob(
      [JSON.stringify({ decisions, autopsies }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qarar-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteHistory() {
    setBusy(true);
    const res = await fetch("/api/user/delete-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    setBusy(false);
    setHistoryOpen(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Could not delete history.");
      return;
    }
    setMsg("All decision history deleted.");
    router.refresh();
  }

  async function deleteAccount() {
    setBusy(true);
    const res = await fetch("/api/user/delete-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    setBusy(false);
    setAccountOpen(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg(j.error ?? "Could not delete account.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Account, notifications, privacy, and data.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <div>
            <label className="text-xs text-text-secondary">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Email</label>
            <Input value={email} disabled className="mt-1 opacity-70" />
          </div>
          <div>
            <label className="text-xs text-text-secondary">Timezone</label>
            <Input value={tz} onChange={(e) => setTz(e.target.value)} className="mt-1" />
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-secondary/50 p-4 text-sm text-text-secondary">
            Current plan: <span className="text-accent-primary">{plan}</span>.
            {stripeCustomerId ? (
              <span className="ml-2">
                <button
                  type="button"
                  onClick={openBillingPortal}
                  className="text-accent-secondary hover:underline"
                >
                  Manage billing
                </button>
              </span>
            ) : (
              <span className="ml-2">
                <a href="/upgrade" className="text-accent-secondary hover:underline">
                  Upgrade
                </a>
              </span>
            )}
          </div>
          {msg && <p className="text-sm text-accent-success">{msg}</p>}
          <Button onClick={saveAccount}>Save changes</Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3 text-sm text-text-secondary">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Pattern alert emails
            <input
              type="checkbox"
              checked={notif.pattern_alerts}
              onChange={(e) =>
                setNotif((n) => ({ ...n, pattern_alerts: e.target.checked }))
              }
              className="h-5 w-5 accent-accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Weekly decision quality digest
            <input
              type="checkbox"
              checked={notif.weekly_digest}
              onChange={(e) =>
                setNotif((n) => ({ ...n, weekly_digest: e.target.checked }))
              }
              className="h-5 w-5 accent-accent-primary"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Monthly cognitive profile update
            <input
              type="checkbox"
              checked={notif.monthly_profile}
              onChange={(e) =>
                setNotif((n) => ({ ...n, monthly_profile: e.target.checked }))
              }
              className="h-5 w-5 accent-accent-primary"
            />
          </label>
          <Button variant="outline" onClick={saveNotifications}>
            Save notification preferences
          </Button>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 text-sm text-text-secondary">
          <p>Data retention: keep all autopsies until you delete them.</p>
          <Button variant="outline" onClick={exportData}>
            Download all my data (JSON)
          </Button>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Anonymized research participation
            <input type="checkbox" className="h-5 w-5 accent-accent-primary" />
          </label>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 text-sm text-text-secondary">
          <p>
            Deleting history or your account is irreversible. Autopsies and profile data tied to
            your account will be removed.
          </p>
          <Button variant="danger" onClick={() => setHistoryOpen(true)}>
            Delete all decision history
          </Button>
          <Button variant="danger" onClick={() => setAccountOpen(true)}>
            Delete account
          </Button>
        </TabsContent>
      </Tabs>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all history?</DialogTitle>
            <DialogDescription>
              This removes every saved decision and autopsy. Your account stays active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setHistoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={busy} onClick={deleteHistory}>
              Delete history
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account and associated data. You will be signed out.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAccountOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={busy} onClick={deleteAccount}>
              Delete account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
