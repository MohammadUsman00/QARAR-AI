import { create } from "zustand";

export type AutopsyPhase = "input" | "loading" | "report";

/** Lightweight UI state — extend as the product grows. */
export const useAppUi = create<{
  autopsyPhase: AutopsyPhase;
  setAutopsyPhase: (p: AutopsyPhase) => void;
}>((set) => ({
  autopsyPhase: "input",
  setAutopsyPhase: (autopsyPhase) => set({ autopsyPhase }),
}));
