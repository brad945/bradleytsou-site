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

  // Added for the Steam-profile layout.
  /** Link / heading blue. */
  link: "#66c0f4",
  /** Profile-background purple. */
  plum: "#3f2350",
  /** Profile-background magenta-maroon. */
  wine: "#2b1526",
  /** Left stop of the panel header gradient. */
  teal: "#2f5d6e",
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

/** One frame-border gradient, tinted. Used by the `frame-tint` keyframes. */
const frameGradient = (colour: string) =>
  `linear-gradient(135deg, ${colour} 0%, ${colour}55 28%, ${colour} 52%, ${colour}44 76%, ${colour} 100%)`;

/** Sparse starfield, tiled. Static — it does not move or react to scroll. */
const starfield = [
  "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.40), transparent)",
  "radial-gradient(1px 1px at 27% 62%, rgba(255,255,255,0.22), transparent)",
  "radial-gradient(1.4px 1.4px at 41% 9%, rgba(255,255,255,0.32), transparent)",
  "radial-gradient(1px 1px at 55% 44%, rgba(255,255,255,0.18), transparent)",
  "radial-gradient(1px 1px at 63% 77%, rgba(255,255,255,0.30), transparent)",
  "radial-gradient(1.2px 1.2px at 74% 24%, rgba(255,255,255,0.26), transparent)",
  "radial-gradient(1px 1px at 82% 58%, rgba(255,255,255,0.20), transparent)",
  "radial-gradient(1px 1px at 91% 88%, rgba(255,255,255,0.34), transparent)",
  "radial-gradient(1px 1px at 6% 84%, rgba(255,255,255,0.24), transparent)",
  "radial-gradient(1.3px 1.3px at 34% 93%, rgba(255,255,255,0.28), transparent)",
  "radial-gradient(1px 1px at 48% 30%, rgba(255,255,255,0.16), transparent)",
  "radial-gradient(1px 1px at 96% 38%, rgba(255,255,255,0.22), transparent)",
].join(", ");

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
        // Mulish stands in for Steam's Motiva Sans: same humanist-geometric
        // proportions, and it has the light weights the big numbers need.
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        starfield,
        // Ambient depth behind the whole page. Static, not animated.
        "page-glow": `radial-gradient(70rem 50rem at 50% -15%, ${tokens.plum}cc, transparent 65%), radial-gradient(50rem 60rem at 108% 30%, ${tokens.wine}dd, transparent 60%), radial-gradient(45rem 55rem at -10% 45%, ${tokens.nebula}33, transparent 60%)`,
        // The "equipped profile background" behind the identity header.
        "profile-hero": `linear-gradient(102deg, #1b1420 0%, #2e1a38 32%, ${tokens.plum} 62%, #5b2a5e 80%, #2c1830 100%)`,
        // Steam's showcase header bar: teal on the left, fading into the
        // profile background on the right.
        "panel-header": `linear-gradient(to right, ${tokens.teal}e6 0%, ${tokens.plum}66 55%, ${tokens.plum}00 100%)`,
        "panel-sheen": `linear-gradient(180deg, ${tokens.panel2} 0%, ${tokens.panel} 100%)`,
        "xp-fill": `linear-gradient(90deg, ${tokens.nebula} 0%, ${tokens.accent} 100%)`,
        // Avatar frame, built from the palette rather than lifted art. The
        // `frame-tint` animation cycles this through the same colours.
        "avatar-frame": frameGradient(tokens.accent),
      },
      boxShadow: {
        panel: `0 1px 0 0 ${tokens.line}, 0 18px 40px -28px #000000`,
        "live-dot": `0 0 0 3px ${tokens.live}26`,
      },
      borderRadius: {
        panel: "3px",
      },
      maxWidth: {
        // 616 main + 16 gap + 308 sidebar — Steam's profile column widths.
        profile: "940px",
      },
      keyframes: {
        // Status pulse, tied to real "is the GitHub feed live" state.
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },

        /*
         * DVD-screensaver bounce for the animated avatar frame, replicating
         * Steam's animated frames. Two axes on two nested elements with
         * different periods and `alternate` — one element can only carry one
         * transform animation, and mismatched periods keep the path from
         * visibly looping. Travel distances assume a 150px avatar and a
         * 42x20 badge; they must change together.
         */
        "dvd-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(108px)" },
        },
        "dvd-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(130px)" },
        },
        // steps(1) so the colour snaps the way it does on a real wall hit.
        "dvd-tint": {
          "0%": { color: tokens.accent, borderColor: tokens.accent },
          "25%": { color: tokens.link, borderColor: tokens.link },
          "50%": { color: tokens.live, borderColor: tokens.live },
          "75%": { color: tokens.nebula, borderColor: tokens.nebula },
        },
        // The frame itself swaps to the same colour on the same beat.
        "frame-tint": {
          "0%": { backgroundImage: frameGradient(tokens.accent) },
          "25%": { backgroundImage: frameGradient(tokens.link) },
          "50%": { backgroundImage: frameGradient(tokens.live) },
          "75%": { backgroundImage: frameGradient(tokens.nebula) },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2.4s ease-in-out infinite",
        "dvd-x": "dvd-x 3.1s linear infinite alternate",
        "dvd-y": "dvd-y 2.3s linear infinite alternate",
        "dvd-tint": "dvd-tint 5.9s steps(1) infinite",
        "frame-tint": "frame-tint 5.9s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
