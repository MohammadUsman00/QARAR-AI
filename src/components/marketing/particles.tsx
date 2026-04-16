"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 18 + Math.random() * 12,
        delay: Math.random() * 8,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute h-1 w-1 rounded-full bg-accent-neural/40"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.55, 0.15],
          }}
          transition={{
            duration: d.duration,
            repeat: Infinity,
            delay: d.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
