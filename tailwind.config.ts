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
  /**
   * Avatar frame band. Four stops of a cool grey, spanning a wide range —
   * the reference goes from a bright highlight at the top-left to a genuinely
   * dark grey at the bottom-right, not a narrow mid-grey wash.
   */
  steelLight: "#d6d9dc",
  steel: "#9ea2a6",
  steelMid: "#6b6f73",
  steelDark: "#4a4d51",
  /** Slate background of the alias dropdown. */
  menu: "#464c58",
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

/**
 * Screensaver colours for the bouncing logo. Deliberately vivid and fully
 * saturated — this is the one place the muted site palette doesn't apply,
 * because the reference logo is a flat bright fill. Flat colour only: no
 * gradient, no glow.
 */
const dvd = {
  yellow: "#ffe500",
  cyan: "#00e0ff",
  magenta: "#ff3cc8",
  green: "#3bff78",
  orange: "#ff7a14",
};

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
        dvd,
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
        /*
         * Avatar frame: a RADIAL gradient with its light source off the
         * top-left corner, falling away to a dark grey at the bottom-right —
         * not a linear sweep, and not a bevel. Matches the reference.
         */
        "avatar-frame": `radial-gradient(125% 125% at 6% 4%, ${tokens.steelLight} 0%, ${tokens.steel} 34%, ${tokens.steelMid} 66%, ${tokens.steelDark} 100%)`,
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
         * DVD-screensaver bounce inside the avatar. Two axes on two nested
         * elements with different periods and `alternate` — one element can
         * only carry one transform animation, and mismatched periods keep the
         * path from visibly looping. Travel distances assume a 150px avatar
         * and an 84x46 logo (150-84=66, 150-46=104); they must change
         * together.
         *
         * Step counts are duration x 10, which pins the motion to 10fps — the
         * chunky cadence of the original screensaver. Change a duration and
         * you must change its step count to keep that framerate.
         */
        "dvd-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(66px)" },
        },
        "dvd-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(104px)" },
        },
        /*
         * The logo is the only thing that changes colour. steps(1) so it snaps
         * the way it does on a real wall hit rather than crossfading. The SVG
         * paints with currentColor, so animating `color` is enough.
         */
        "dvd-tint": {
          "0%": { color: dvd.yellow },
          "20%": { color: dvd.cyan },
          "40%": { color: dvd.magenta },
          "60%": { color: dvd.green },
          "80%": { color: dvd.orange },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2.4s ease-in-out infinite",
        // 3.1s x 10fps = 31 steps; 2.3s x 10fps = 23 steps.
        "dvd-x": "dvd-x 3.1s steps(31) infinite alternate",
        "dvd-y": "dvd-y 2.3s steps(23) infinite alternate",
        "dvd-tint": "dvd-tint 7.3s steps(1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
