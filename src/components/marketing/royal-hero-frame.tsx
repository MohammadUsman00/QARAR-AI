"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function RoyalHeroFrame({ children }: { children: ReactNode }) {
  return (
    <div className="royal-hero-frame relative mx-auto max-w-5xl p-[1px]">
      <motion.div
        className="royal-hero-shine absolute inset-0 rounded-[1.25rem] opacity-60"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-[1.2rem] bg-bg-primary/90 px-6 py-16 backdrop-blur-xl md:px-12 md:py-20">
        {children}
      </div>
    </div>
  );
}
