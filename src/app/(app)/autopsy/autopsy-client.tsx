"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AutopsyResult } from "@/lib/gemini";
import { downloadAutopsyPdf } from "@/lib/pdf-export";
import { apiErrorMessage } from "@/lib/api-errors";
import { UpgradeModal } from "@/components/upgrade-modal";
import { useAppUi } from "@/stores/use-app";

const prompts = [
  "What happened?",
  "Tell me about the decision you regret...",
  "Describe it like you're texting a friend...",
];

const loadingLines = [
  "Analyzing emotional state...",
  "Cross-referencing with your decision history...",
  "Identifying cognitive patterns...",
  "Mapping triggers to life events...",
  "Generating your personal autopsy...",
];

const domains = [
  "career",
  "relationship",
  "financial",
  "health",
  "social",
  "other",
];

const emotions = [
  "Angry",
  "Anxious",
  "Excited",
  "Tired",
  "Pressured",
  "Hurt",
  "Confident",
  "Uncertain",
];

export function AutopsyClient() {
  const router = useRouter();
  const search = useSearchParams();
  const decisionId = search.get("decision");

  const phase = useAppUi((s) => s.autopsyPhase);
  const setPhase = useAppUi((s) => s.setAutopsyPhase);
  const [promptIdx, setPromptIdx] = useState(0);
  const [raw, setRaw] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [when, setWhen] = useState("");
  const [domain, setDomain] = useState("other");
  const [emotion, setEmotion] = useState("Uncertain");
  const [outcome, setOutcome] = useState(5);
  const [result, setResult] = useState<AutopsyResult | null>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pdfAllowed, setPdfAllowed] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d: { limits?: { pdf_export?: boolean } }) => {
        setPdfAllowed(Boolean(d.limits?.pdf_export));
      })
      .catch(() => {});
  }, []);

  const loadExisting = useCallback(async () => {
    if (!decisionId) return;
    const supabase = createClient();
    const { data: autopsy } = await supabase
      .from("autopsies")
      .select(
        "full_report, root_cause, cognitive_biases, emotional_triggers, life_patterns, nervous_system_state, wait_72hr_probability, alternate_outcome_probability, estimated_cost_context, immediate_actions, pattern_break_strategy",
      )
      .eq("decision_id", decisionId)
      .maybeSingle();

    if (!autopsy) return;

    const { data: dec } = await supabase
      .from("decisions")
      .select("raw_input, title")
      .eq("id", decisionId)
      .maybeSingle();

    setResult({
      root_cause: autopsy.root_cause ?? "",
      cognitive_biases: (autopsy.cognitive_biases as AutopsyResult["cognitive_biases"]) ?? [],
      emotional_triggers:
        (autopsy.emotional_triggers as AutopsyResult["emotional_triggers"]) ?? [],
      life_patterns: (autopsy.life_patterns as AutopsyResult["life_patterns"]) ?? [],
      nervous_system_state: autopsy.nervous_system_state ?? "",
      wait_72hr_probability: autopsy.wait_72hr_probability ?? 0,
      alternate_outcome_probability: autopsy.alternate_outcome_probability ?? 0,
      estimated_cost_context: autopsy.estimated_cost_context ?? "",
      immediate_actions: (autopsy.immediate_actions as AutopsyResult["immediate_actions"]) ?? [],
      pattern_break_strategy: autopsy.pattern_break_strategy ?? "",
      full_report_markdown: autopsy.full_report ?? "",
    });
    setRaw(dec?.raw_input ?? "");
    setPhase("report");
    setTyped(autopsy.full_report ?? "");
  }, [decisionId, setPhase]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPromptIdx((i) => (i + 1) % prompts.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setInterval(() => {
      setLoadingIdx((i) => (i + 1) % loadingLines.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "report" || !result?.full_report_markdown) return;
    const full = result.full_report_markdown;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 4);
    return () => window.clearInterval(id);
  }, [phase, result]);

  async function run() {
    setError(null);
    setPhase("loading");
    const res = await fetch("/api/autopsy/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_input: raw,
        domain,
        emotional_state: emotion,
        decision_date: when || null,
        outcome_rating: outcome,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 403 && json.error === "limit_reached") {
        setShowUpgrade(true);
        setError(null);
        setPhase("input");
        return;
      }
      setError(apiErrorMessage(json, res.status));
      setPhase("input");
      return;
    }
    setResult(json.result as AutopsyResult);
    setPhase("report");
    setTyped("");
    router.replace(`/autopsy?decision=${json.decision_id as string}`);
  }

  const charCount = useMemo(() => raw.length, [raw]);

  function handleExportPdf() {
    if (!result) return;
    if (!pdfAllowed) {
      setShowUpgrade(true);
      return;
    }
    downloadAutopsyPdf(
      "Qarar autopsy",
      `${result.full_report_markdown}\n\n---\n${result.root_cause}`,
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-text-primary md:text-3xl">
            New Decision Autopsy
          </h1>
          <p className="font-display text-sm italic text-accent-primary">قرار</p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="min-h-[48px] text-sm text-text-secondary">
              <AnimatePresence mode="wait">
                <motion.p
                  key={promptIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-accent-secondary"
                >
                  {prompts[promptIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="relative">
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={12}
                placeholder='I quit my job after one bad meeting with my manager. I sent the resignation the same evening...'
                className="w-full resize-none border-0 border-b border-border-subtle bg-transparent px-0 py-3 font-sans text-lg text-text-primary caret-accent-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-0"
              />
              <div className="text-right text-xs text-text-tertiary">{charCount} chars</div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm text-accent-primary hover:underline"
            >
              {expanded ? "Hide" : "Add"} optional context
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 rounded-xl border border-border-subtle bg-bg-secondary/40 p-4"
              >
                <div>
                  <label className="text-xs text-text-secondary">When did this happen?</label>
                  <input
                    type="date"
                    value={when}
                    onChange={(e) => setWhen(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border-subtle bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary">Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border-subtle bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
                  >
                    {domains.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary">Emotional state</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {emotions.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmotion(em)}
                        className={`rounded-full border px-3 py-1 text-xs min-h-[36px] ${
                          emotion === em
                            ? "border-accent-primary text-accent-primary"
                            : "border-border-subtle text-text-secondary"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary">
                    How did it turn out? {outcome}/10
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={outcome}
                    onChange={(e) => setOutcome(Number(e.target.value))}
                    className="mt-2 w-full accent-accent-primary"
                  />
                </div>
              </motion.div>
            )}

            {error && <p className="text-sm text-accent-danger">{error}</p>}

            <Button
              className="w-full"
              disabled={raw.trim().length < 20}
              onClick={run}
            >
              Run the Autopsy
            </Button>
          </motion.div>
        )}

        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center"
          >
            <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-bg-tertiary">
              <motion.div
                className="h-full w-1/3 bg-accent-primary"
                animate={{ x: ["-30%", "120%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <svg
              width="160"
              height="120"
              viewBox="0 0 160 120"
              className="text-accent-neural/40"
            >
              <motion.path
                d="M20 60 Q40 20 80 60 T140 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.circle
                  key={i}
                  cx={30 + i * 25}
                  cy={55 + (i % 2) * 10}
                  r="3"
                  fill="var(--accent-primary)"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </svg>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-md text-sm text-text-secondary"
              >
                {loadingLines[loadingIdx]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {phase === "report" && result && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary/60 p-6 shadow-glowGold">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent-primary">
                    Decision Autopsy
                  </div>
                  <div className="mt-2 font-heading text-xl text-text-primary">
                    Structured analysis
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-8">
                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    What happened
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap font-mono text-sm italic text-text-secondary">
                    {raw}
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    Root cause identified
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-primary">
                    {result.root_cause}
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    Cognitive biases detected
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.cognitive_biases.map((b) => (
                      <Badge key={b.name} variant="neural">
                        {b.name}
                      </Badge>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                    {result.cognitive_biases.map((b) => (
                      <li key={b.name}>
                        <span className="text-text-primary">{b.name}</span> — {b.description}{" "}
                        <span className="text-text-tertiary">({b.severity})</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    If you had waited 72 hours
                  </h3>
                  <div className="mt-3 font-heading text-3xl text-accent-primary">
                    {Math.round(result.wait_72hr_probability * 100)}%
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Estimated chance you would not have repeated the same impulse.
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    Estimated cost context
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {result.estimated_cost_context}
                  </p>
                </section>

                <section>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-neural">
                    What to do now
                  </h3>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
                    {result.immediate_actions.map((a) => (
                      <li key={a.action}>
                        <span className="text-text-primary">{a.action}</span> — {a.why}
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="rounded-xl border border-border-subtle bg-bg-primary/60 p-4">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-accent-primary">
                    Full report (streamed)
                  </h3>
                  <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-accent-primary/95">
                    {typed || result.full_report_markdown}
                  </pre>
                </section>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button variant="outline" onClick={() => window.print()}>
                Print
              </Button>
              <Button variant="outline" onClick={handleExportPdf}>
                Export PDF
              </Button>
              <Button variant="ghost" onClick={() => router.push("/history")}>
                History
              </Button>
              <Button
                onClick={() => {
                  setPhase("input");
                  setResult(null);
                  setRaw("");
                  router.replace("/autopsy");
                }}
              >
                Start a new autopsy
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
