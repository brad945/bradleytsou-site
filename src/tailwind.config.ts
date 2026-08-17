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

        /*
         * Exy's tail, wagging where it pokes out from behind the avatar.
         *
         * A rotation of the one real tail frame rather than a cut sequence of
         * them. His tail moves fast enough that every frame of the source
         * clip is motion-blurred into a different shape, so a real sequence
         * read as several different tails flashing rather than as one tail
         * swinging. Rotating a single clean frame is the thing that actually
         * looks like a wag.
         *
         * **The pivot is the point, and it lives at the call site**
         * (`origin-[92%_83%]`): that's the tail's base, measured off the
         * asset as the widest row of its alpha. Rotating about the element's
         * default centre swings the whole tail like a propeller, and worse,
         * swings its cropped root out from behind the photo where the straight
         * cut edge becomes visible. About the base, the root stays put and
         * hidden, and only the tip travels.
         *
         * Two amplitudes: a slow, shallow idle so a static tail doesn't read
         * as a broken image, and a faster, wider one on hover that answers the
         * pointer. Both are `motion-safe` at the call site.
         */
        wag: {
          "0%, 100%": { transform: "rotate(-6deg)" },
          "50%": { transform: "rotate(6deg)" },
        },
        "wag-fast": {
          "0%, 100%": { transform: "rotate(-13deg)" },
          "50%": { transform: "rotate(13deg)" },
        },

        /*
         * One glyph of the nav's `bt.` mark hopping. Three animation names
         * below share it at different delays, so the hop travels b -> t -> .
         * — the same order the animated favicon uses.
         *
         * **The distances are viewBox user units, not CSS pixels.** This runs
         * on `<g>` elements inside the mark's `0 0 408 292` viewBox, and a CSS
         * length in a transform on an SVG child resolves in that coordinate
         * system. So it scales with the mark rather than needing retuning per
         * size: 90 of 292 units is ~31% of the mark's height whatever it
         * renders at, which is ~11px in the 36px nav. Writing -11px here would
         * have moved it 11 units — about 1.4px, near enough to nothing.
         *
         * **The mark's viewBox is its exact ink bounds, so the glyphs sit
         * flush against the top edge and any hop clips.** The call site has to
         * pass `overflow-visible`. Expanding the viewBox instead is not an
         * option — `app/icon.tsx` places the mark by those bounds.
         *
         * The per-keyframe easing is what makes it a bounce rather than a
         * float: a thrown object decelerates going up and accelerates coming
         * down, so the rise is ease-out and the fall ease-in. One ease-in-out
         * across the whole thing reads as bobbing in water. The smaller hop at
         * 72% is the settle — a single bounce stops dead at the floor — and
         * the rest from 86% keeps repeats landing as separate hops.
         */
        /*
         * Exy walking out from behind the avatar when his tail is clicked.
         *
         * `-100%` is his own width, so he starts exactly one body-length left
         * of the slot — which is inside the photo's box, where the frame
         * paints over him — and ends flush against its right edge, fully out.
         * Being a percentage, it stays correct if the sprite is resized.
         *
         * `linear`, because he's walking at a constant speed; any easing here
         * would slide his feet at one end or the other. The duration is
         * derived from that speed at the call site, not chosen.
         */
        "exy-emerge": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },

        /*
         * Exy shaking himself when you poke him.
         *
         * The amplitude decays — 3px down to 1 — because a shake that stays
         * even reads as a UI error state, the "wrong password" wobble. Losing
         * energy is what makes it read as an animal rather than a widget.
         *
         * A degree and a half of roll rides along with it, so it's a body
         * shaking rather than a picture sliding side to side.
         *
         * **It must live on a wrapper, not on the sprite.** The sprite carries
         * an inline `scaleX(-1)` when he faces left, and an animation's
         * transform beats inline styles in the cascade — so animating the
         * image itself would flip him round for the duration of every shake.
         */
        "exy-shake": {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "15%": { transform: "translateX(-3px) rotate(-1.5deg)" },
          "30%": { transform: "translateX(3px) rotate(1.5deg)" },
          "45%": { transform: "translateX(-2px) rotate(-1deg)" },
          "60%": { transform: "translateX(2px) rotate(1deg)" },
          "80%": { transform: "translateX(-1px) rotate(-0.5deg)" },
        },

        "glyph-hop": {
          "0%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.33, 0, 0.2, 1)",
          },
          "30%": {
            transform: "translateY(-90px)",
            animationTimingFunction: "cubic-bezier(0.6, 0, 0.9, 0.4)",
          },
          "58%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.33, 0, 0.2, 1)",
          },
          "72%": {
            transform: "translateY(-26px)",
            animationTimingFunction: "cubic-bezier(0.6, 0, 0.9, 0.4)",
          },
          "86%, 100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 2.4s ease-in-out infinite",
        // jump-none, not the default jump-end — see the keyframe note.
        // fps = steps / duration, so both of these are 10fps.
        // Durations must stay X_HIT / Y_HIT or the tint desyncs from the walls.
        "dvd-x": `dvd-x ${X_HIT}s steps(15, jump-none) infinite alternate`,
        "dvd-y": `dvd-y ${Y_HIT}s steps(17, jump-none) infinite alternate`,
        "dvd-tint": `dvd-tint ${HIT_CYCLE}s linear infinite`,
        // ease-in-out, not linear: a tail decelerates at the end of each
        // swing and snaps back through the middle. Linear reads mechanical.
        wag: "wag 1.9s ease-in-out infinite",
        "wag-fast": "wag-fast 0.5s ease-in-out infinite",
        /*
         * Three names for one keyframe set, differing only in delay — because
         * **the delay has to live inside the `animation` shorthand.**
         *
         * The obvious spelling is one `animate-glyph-hop` plus a per-glyph
         * arbitrary delay utility, and it silently does nothing: the shorthand
         * resets every animation sub-property it omits, delay included, and
         * Tailwind emits the arbitrary-property rule *before* the animation
         * one. So the shorthand won and all three glyphs hopped together.
         *
         * (Don't spell that utility out here even as an example — the scanner
         * reads comments, and it gets emitted as a real, dead rule.)
         *
         * Second time value in the shorthand is the delay; the first is the
         * duration. No timing function on purpose — the keyframes set their
         * own per-segment easing.
         */
        /*
         * One hop per hover, not a loop. The class only applies while the
         * pointer is on the mark, so dropping `infinite` means it runs its
         * single cycle and rests — and moving off and back on restarts it,
         * because the class is removed and re-added.
         */
        "glyph-hop": "glyph-hop 0.9s",
        "glyph-hop-2": "glyph-hop 0.9s 110ms",
        "glyph-hop-3": "glyph-hop 0.9s 220ms",
        // 800ms is EMERGE_MS in Exy.tsx — his walking speed over the slot's
        // width. `forwards` holds him at the far edge until the component
        // hands off to free walking on the same frame.
        "exy-emerge": "exy-emerge 800ms linear forwards",
        "exy-shake": "exy-shake 450ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
