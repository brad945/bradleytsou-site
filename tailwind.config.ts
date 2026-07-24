import type { Config } from "tailwindcss";

/**
 * Single source of truth for colour on this site.
 * Nothing outside this file should contain a raw hex — if you need a new
 * colour, add a token here first.
 */
const tokens = {
  base: "#0c0d11",
  panel: "#15171e",
  panel2: "#1c1f29",
  line: "#2a2d3a",
  ink: "#e9e7e2",
  muted: "#8b90a0",
  accent: "#de9b35",
  nebula: "#5b3fae",
  live: "#5cc98f",
};

/**
 * Item Showcase rarity tiers. Rarity encodes how central a project is to
 * Bradley's work — not how "cool" it is. Derived from the palette above so
 * the showcase never drifts off-system.
 */
const rarity = {
  core: tokens.accent,
  major: tokens.nebula,
  side: tokens.muted,
};

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...tokens,
        rarity,
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        // Ambient depth behind the profile column. Static, not animated.
        "nebula-glow": `radial-gradient(60rem 40rem at 15% -10%, ${tokens.nebula}2e, transparent 60%), radial-gradient(45rem 30rem at 90% 0%, ${tokens.accent}14, transparent 55%)`,
        "panel-sheen": `linear-gradient(180deg, ${tokens.panel2} 0%, ${tokens.panel} 100%)`,
        "xp-fill": `linear-gradient(90deg, ${tokens.nebula} 0%, ${tokens.accent} 100%)`,
      },
      boxShadow: {
        panel: `0 1px 0 0 ${tokens.line}, 0 18px 40px -28px #000000`,
        "live-dot": `0 0 0 3px ${tokens.live}26`,
      },
      borderRadius: {
        panel: "10px",
      },
      keyframes: {
        // The only motion on the site: a status pulse tied to real "is the
        // GitHub feed live" state. No scroll-triggered decoration.
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
