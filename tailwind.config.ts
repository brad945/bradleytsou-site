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
   * Avatar frame band. A NARROW range of medium greys — the reference band
   * is mid-grey throughout with only a gentle top-left-to-bottom-right fall.
   * A wide light-to-dark range reads as a completely different object.
   */
  steelLight: "#8a8e94",
  steel: "#74787e",
  steelMid: "#65696f",
  steelDark: "#575b61",
  /** Raised-bevel highlight (top/left edges) and shadow (bottom/right). */
  frameHi: "#9ea3a9",
  frameLo: "#484c51",
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

/**
 * Bounce timing. `alternate` means each iteration ends against a wall, so an
 * axis hits one every `duration` — 1.5s on x, 1.7s on y.
 */
const X_HIT = 1.5;
const Y_HIT = 1.7;
/**
 * Both axes only realign after the lcm of their full there-and-back cycles
 * (3.0s and 3.4s), so the hit pattern repeats every 51s. That's the tint
 * animation's period: 62 hits, of which two — 25.5s and 51s — are corners
 * where both axes land at once.
 */
const HIT_CYCLE = 51;

/**
 * Colour changes on wall contact and nowhere else, the way the screensaver
 * does. Rather than run a timer that drifts against the bounce, this lays a
 * keyframe stop at every moment an axis reverses. `steps(1)` on each stop
 * holds the colour flat until the next hit instead of interpolating toward it.
 */
function tintKeyframes(palette: string[]) {
  const hits = Array.from(
    new Set([
      ...Array.from({ length: Math.round(HIT_CYCLE / X_HIT) }, (_, i) => (i + 1) * X_HIT),
      ...Array.from({ length: Math.round(HIT_CYCLE / Y_HIT) }, (_, i) => (i + 1) * Y_HIT),
    ].map((t) => Number(t.toFixed(6)))),
  ).sort((a, b) => a - b);

  const frames: Record<string, Record<string, string>> = {
    "0%": { color: palette[0], animationTimingFunction: "steps(1)" },
  };

  // The final hit lands exactly on the loop point, where the wrap back to
  // palette[0] supplies that corner's colour change.
  hits.slice(0, -1).forEach((t, i) => {
    // Six decimals keeps each stop within ~0.001ms of the true hit; four
    // leaves it visibly late under fine sampling.
    frames[`${((t / HIT_CYCLE) * 100).toFixed(6)}%`] = {
      color: palette[(i + 1) % palette.length],
      animationTimingFunction: "steps(1)",
    };
  });

  const last = hits.length - 1;
  frames["100%"] = {
    color: palette[last % palette.length],
    animationTimingFunction: "steps(1)",
  };

  return frames;
}

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
        "avatar-frame": `radial-gradient(130% 130% at 8% 6%, ${tokens.steelLight} 0%, ${tokens.steel} 42%, ${tokens.steelMid} 72%, ${tokens.steelDark} 100%)`,
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
         * path from visibly looping. Travel distances assume the avatar's
         * 148px padding box (150px box-border minus the 1px well) and a 62x34
         * logo, which is 42% of the photo width as in the reference:
         * 148-62=86, 148-34=114. They must change together.
         *
         * Step counts are duration x 10, which pins the motion to 10fps — the
         * chunky cadence of the original screensaver. Change a duration and
         * you must change its step count to keep that framerate.
         *
         * Travel MUST divide evenly by its step count: 85/17 = 5px and
         * 112/16 = 7px. A fractional step (86/25 = 3.44px) lands the logo on
         * a different subpixel phase every frame, so the browser re-antialiases
         * the letterforms and the whole thing visibly jitters.
         *
         * Between those two rules, speed can only be a multiple of 10 px/s
         * (speed = 10 x px-per-step). To change it, pick the next whole
         * px-per-step and re-derive the logo size so the travel still divides.
         */
        "dvd-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(84px)" },
        },
        "dvd-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(112px)" },
        },
        /*
         * The logo is the only thing that changes colour, and it changes only
         * on wall contact — see tintKeyframes. The SVG paints with
         * currentColor, so animating `color` is enough.
         */
        "dvd-tint": tintKeyframes([
          dvd.yellow,
          dvd.cyan,
          dvd.magenta,
          dvd.green,
          dvd.orange,
        ]),
      },
      animation: {
        "pulse-live": "pulse-live 2.4s ease-in-out infinite",
        // jump-none, not the default jump-end — see the keyframe note.
        // fps = steps / duration, so both of these are 10fps.
        // Durations must stay X_HIT / Y_HIT or the tint desyncs from the walls.
        "dvd-x": `dvd-x ${X_HIT}s steps(15, jump-none) infinite alternate`,
        "dvd-y": `dvd-y ${Y_HIT}s steps(17, jump-none) infinite alternate`,
        "dvd-tint": `dvd-tint ${HIT_CYCLE}s linear infinite`,
      },
    },
  },
  plugins: [],
};

export default config;
