import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          danger: "var(--accent-danger)",
          success: "var(--accent-success)",
          neural: "var(--accent-neural)",
        },
        muted: {
          DEFAULT: "var(--text-secondary)",
          foreground: "var(--text-tertiary)",
        },
        border: {
          subtle: "var(--border-subtle)",
          active: "var(--border-active)",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        heading: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-dm)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        glowGold: "var(--glow-gold)",
        glowNeural: "var(--glow-neural)",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "pulse-gold": "pulse-gold 1.8s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
