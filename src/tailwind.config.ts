import type { Config } from "tailwindcss";

/**
 * Single source of truth for colour on this site.
 * Nothing outside this file should contain a raw hex — if you need a new
 * colour, add a token here first.
 */
const tokens = {
  /*
   * The page behind the column. Steam sets `body.profile_page` to #000000 —
   * profile pages are black, and the blue #1b2838 in globalv2.css is the
   * community/store body, a different surface. Using the blue here made the
   * whole viewport one flat expanse with no column to see.
   */
  base: "#000000",
  panel: "#131c27",
  panel2: "#0e141c",
  line: "#323e4c",
  /**
   * Text ramp, tuned to Steam's. Steam runs cool blue-greys, not warm creams,
   * and reserves pure white for headings — `ink` was #e9e7e2 and read warm
   * against everything else.
   */
  bright: "#ffffff",
  ink: "#e5e8ea",
  copy: "#c7d5e0",
  muted: "#8f98a0",
  accent: "#de9b35",
  nebula: "#417a9b",
  live: "#5cc98f",

  // Added for the Steam-profile layout.
  /** Link / heading blue. */
  link: "#66c0f4",
  /*
   * The three bio-line colours. They've been in three positions: on the whole
   * sentence, off entirely when Bradley wanted the bio white, and now on the
   * **org link only** — the sentence stays white and the org name carries its
   * colour, so the hue marks the word it belongs to rather than tinting a line
   * of unrelated text.
   *
   * The values took several passes to land and the reasoning is worth not
   * relearning:
   *
   * - `berkeley` #dca009 is hsl(43, 92, 45). It went to hue 48 once and read
   *   too yellow and too bright, so it's back near California Gold's own 41
   *   and darker — gold rather than lemon. Raising the hue past ~46 or the
   *   lightness past ~50 is what makes it yellow again. 6.45:1.
   *   Berkeley's blue can't be used at all here: #003262 is 1.16:1 on this
   *   column, lost in the background's own hue family.
   * - `medimpact` #b771f4 is hsl(272, 85, 70), darkened from 74 by request.
   *   **70 is the floor.** It's the least legible colour on the page at
   *   4.75:1, and one more step down — L=66, #ad5ff2 — is 4.05:1, under the
   *   4.5:1 AA needs for text this size. Darker means dropping saturation
   *   too, or accepting a fail.
   * - `deveval` #60ebdb is hsl(173, 78, 65). "More teal" means more saturated
   *   and slightly darker, NOT bluer — 180 is where cyan sits, and a pass that
   *   moved the hue that way is why it had to be asked twice.
   *
   * The trap is re-harmonising all three to a shared saturation. They ran
   * 60/65/76% once and read as highlighters — text more chromatic than the
   * page it sat on. That risk is lower now they're a word each rather than
   * three full lines, but it's the same mistake.
   */
  berkeley: "#dca009",
  deveval: "#60ebdb",
  medimpact: "#b771f4",
  /** Steam blue, used for panel bars. */
  plum: "#2a475e",
  /** Steam global-header near-black. */
  wine: "#171d25",
  /** Panel header bar — flat, was the left stop of a teal->purple gradient. */
  teal: "#2a475e",
  /** Profile header background — flat, was a five-stop purple sweep. */
  /**
   * The centred content column — Steam's #1b2838. On a real profile this
   * surface is the user's profile background image; here it's the flat blue,
   * which is what makes the column read as a column against the black page.
   */
  hero: "#1b2838",
  /**
   * Avatar frame band. A NARROW range of medium greys — the reference band
   * is mid-grey throughout with only a gentle top-left-to-bottom-right fall.
   * A wide light-to-dark range reads as a completely different object.
   */
  steelLight: "#9a9ea4",
  steel: "#787c82",
  steelMid: "#60646a",
  steelDark: "#4b4f55",
  /** Raised-bevel highlight (top/left edges) and shadow (bottom/right). */
  frameHi: "#b0b5bb",
  frameLo: "#3e4247",
  /** Slate background of the alias dropdown. */
  menu: "#464c58",
  /** Global nav bar — Steam's header sits darker and bluer than the page. */
  chrome: "#171a21",
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
    new Set(
      [
        ...Array.from(
          { length: Math.round(HIT_CYCLE / X_HIT) },
          (_, i) => (i + 1) * X_HIT,
        ),
        ...Array.from(
          { length: Math.round(HIT_CYCLE / Y_HIT) },
          (_, i) => (i + 1) * Y_HIT,
        ),
      ].map((t) => Number(t.toFixed(6))),
    ),
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

/**
 * Sparse starfield, tiled. Static — it does not move or react to scroll.
 * These are radial-gradients only in the CSS sense: each one paints a single
 * 1px dot, not a colour transition. Kept when the decorative gradients went.
 */
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
  /*
   * Resolved from the project root, not from this file's directory: Tailwind
   * only rebases these onto the config's own folder when `content.relative`
   * is set, and it isn't. Keep them root-relative if this file ever moves.
   */
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ...tokens,
        rarity,
        dvd,
      },
      fontFamily: {
        /*
         * "Motiva Sans" leads both stacks, so anyone who has Steam's actual
         * face installed locally gets it. It is NOT loaded by the site and
         * cannot be: Motiva Sans is Typotheque's, sold per-use, and shipping
         * the file would need a paid webfont licence. Nothing here downloads
         * it — this only names it.
         *
         * So for practically every visitor the next entry is what renders.
         * Open Sans stands in — Bradley chose it from a side-by-side of six
         * free faces set in this page's own headings. Its weight range starts
         * at 300, so nothing here should ask for 200.
         */
        display: [
          "Motiva Sans",
          "var(--font-display)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        body: [
          "Motiva Sans",
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        /*
         * Signage only — the "Coming soon" cover. Kept out of `display` and
         * `body` on purpose: a poster face has no business in the page's own
         * typography, which is one family at light weights.
         */
        sign: ["var(--font-sign)", "ui-sans-serif", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      backgroundImage: {
        starfield,
        /*
         * Avatar frame. The one gradient left on the site: it's material
         * shading, not decoration — the reference frame is genuinely lit from
         * the top-left, and flattening it makes the bevel disappear. Every
         * decorative gradient (page glow, profile hero, panel bars, panel
         * sheen, xp fill) was removed.
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
        /*
         * Steam's own column widths are 616 main + 16 gap + 308 sidebar = 940.
         * Widened 25px per side at Bradley's request, to give the text more
         * room: 990 splits 2fr/1fr into ~649 + 16 + ~325. A deliberate
         * departure from the reference — the ratio is kept, the absolute
         * widths no longer match Steam's.
         */
        profile: "990px",
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
          to: { transform: "translateX(98px)" },
        },
        "dvd-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(128px)" },
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
