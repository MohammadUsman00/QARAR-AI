"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [plan, setPlan] = useState("free");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("user_profiles")
        .select("full_name, timezone, plan")
        .eq("id", user.id)
        .single();
      setName(data?.full_name ?? "");
      setTz(data?.timezone ?? "Asia/Kolkata");
      setPlan(data?.plan ?? "free");
    });
  }, []);

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
            Current plan: <span className="text-accent-primary">{plan}</span>. Manage billing from{" "}
            <a href="/upgrade" className="text-accent-secondary hover:underline">
              Upgrade
            </a>
            .
          </div>
          {msg && <p className="text-sm text-accent-success">{msg}</p>}
          <Button onClick={saveAccount}>Save changes</Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3 text-sm text-text-secondary">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Pattern alert emails
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Weekly decision quality digest
            <input type="checkbox" className="h-5 w-5 accent-accent-primary" />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle bg-bg-secondary/40 px-4 py-3">
            Monthly cognitive profile update
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-accent-primary" />
          </label>
          <p className="text-xs text-text-tertiary">
            Wire these toggles to a `notification_settings` table when you move beyond the free build.
          </p>
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
            Deleting history or your account is irreversible. Implement confirmation modals + service
            role deletes in production.
          </p>
          <Button variant="danger" disabled>
            Delete all decision history
          </Button>
          <Button variant="danger" disabled>
            Delete account
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
