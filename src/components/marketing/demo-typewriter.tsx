"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DEMO = `DECISION AUTOPSY — Career / Impulse exit

ROOT CAUSE: You equated a single interaction with identity threat, not information.

COGNITIVE BIASES:
• Emotional reasoning — "felt disrespected" became "must leave now"
• Sunk cost blindness toward future option value of the role

WAIT 72 HOURS PROBABILITY: 78% you would not have sent the resignation.

ESTIMATED PATTERN COST: ₹4,20,000+ in lost earnings and rehire friction since 2021.`;

export function DemoTypewriter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [text, setText] = useState("");

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setText(DEMO.slice(0, i));
      if (i >= DEMO.length) window.clearInterval(id);
    }, 12);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <div ref={ref} className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-primary/80 p-6 shadow-glowGold">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-accent-primary/80">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent-success" />
        live preview
      </div>
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-accent-primary/95">
        {text}
        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-accent-primary/70 align-middle" />
      </pre>
    </div>
  );
}
