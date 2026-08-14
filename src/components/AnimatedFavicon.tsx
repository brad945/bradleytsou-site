"use client";

import { useEffect } from "react";

/**
 * The tab icon, with the `bt.` glyphs hopping in sequence — b, then t, then
 * the period — like a row of bouncing dots.
 *
 * ## How it works, and why it isn't a hack
 *
 * There's no animated-favicon format worth using. Animated GIF favicons are
 * supported inconsistently and can't be driven by anything, and SVG favicons
 * ignore CSS animation in Chrome. What every browser *does* honour is a change
 * to the `href` of `<link rel="icon">`: set it to a new data URL and the tab
 * repaints. So this draws each frame to a canvas, exports a PNG data URL, and
 * swaps it in — a supported API used as intended, just quickly.
 *
 * ## Why this animation is smoother than the one it replaced
 *
 * The mark used to drift around the tile and bounce off the walls. Two things
 * made that read as choppy, and the hop fixes both:
 *
 * 1. **It travelled far.** Crossing 11px in well under a second is a large
 *    jump between frames at any frame rate. A 3px hop moves a fraction of that
 *    per frame, so consecutive frames sit close together — which is what
 *    "smooth" actually is.
 * 2. **It never repeated exactly.** Time-based drift lands on a new sub-pixel
 *    position every frame, so no frame could be reused and every one cost a
 *    synchronous PNG encode on the main thread. That was the stutter.
 *
 * The hop is strictly periodic, so the whole animation is a function of one
 * number: how far through the loop we are. Frames are cached by index, the
 * first circuit fills the cache, and every frame after costs a single string
 * assignment.
 *
 * ## The rest of the costs
 *
 * - **It needs JS**, so the static `/icon` route stays the real favicon and
 *   this replaces it after hydration. With JS off nothing is lost.
 * - **It stops when the tab is hidden** and restores the static icon — rAF is
 *   throttled in background tabs, and a tab frozen mid-hop reads as broken
 *   rather than paused. Same on unmount, and it never starts under
 *   `prefers-reduced-motion`.
 * - **The icon link is re-acquired, not captured.** `AutoRefresh` refreshes
 *   the route every 300s and that can replace the element; holding the
 *   original meant the animation kept writing to a detached node and the tab
 *   froze after five minutes.
 *
 * ## The mark
 *
 * Drawn as canvas primitives rather than reusing `BtMark`, which is an SVG
 * component — rasterising it per frame would mean an image load and a
 * `drawImage` each time. Same 408x292 ink bounds, so the two stay one mark,
 * but **they are two implementations of it** and a change to the letterforms
 * has to be made in both.
 */

/** The tab icon is 16 CSS px; 32 keeps it sharp on a 2x display. */
const SIZE = 32;

/**
 * Mark size. Bigger than the drifting version managed, because a hop needs
 * only a few px of headroom where travel needed a third of the tile — the
 * space that was travel is now legibility, and the b's counter stays open.
 */
const MARK_W = 26;
const MARK_H = Math.round((MARK_W * 292) / 408);

/** Hop height. Deliberately small — see above on why less movement reads as
 *  smoother rather than lazier. */
const AMP = 3;

/** One full cycle, in ms. */
const LOOP = 1400;

/**
 * Where each glyph sits in that cycle, as a fraction of it.
 *
 * b leads, t follows, the period last, so it reads left to right. The gaps are
 * small enough that the three overlap — spaced further apart they stop being
 * one mark moving and become three things taking turns.
 */
const PHASES = [0, 0.11, 0.22];

/**
 * Fraction of a glyph's cycle spent in the air; the rest is rest.
 *
 * Below ~0.5 the hop is too quick to follow at this size; at 1 there's no
 * pause and it reads as a wave rather than a bounce.
 */
const DUTY = 0.55;

/** Frames per loop. 60fps against `LOOP` — the cache is exactly this long. */
const FPS = 60;
const FRAMES = Math.round((LOOP / 1000) * FPS);

/** `bright` white. The mark doesn't change colour — the motion is the point. */
const MARK_COLOUR = "#ffffff";

/**
 * One glyph's vertical offset at loop position `u` (0..1), in px, negative
 * being up.
 *
 * A half-sine over the duty window: it leaves the ground at zero speed, slows
 * at the top and lands at zero speed. A linear or triangular hop reads
 * mechanical at this size, because the direction change is instantaneous.
 */
function hop(u: number, phase: number): number {
  /*
   * Subtracted, not added. Adding a phase puts a glyph *ahead* in its cycle,
   * which ran the ripple right to left — the period hopping first and b last.
   * Subtracting makes each phase a delay, so b leads as intended.
   */
  const t = (u - phase + 1) % 1;
  if (t >= DUTY) return 0;
  return -AMP * Math.sin((Math.PI * t) / DUTY);
}

/**
 * The `bt.` mark, scaled from its 408x292 ink bounds, each glyph offset
 * vertically by its own amount. Mirrors `BtMark`'s geometry.
 */
function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  offsets: [number, number, number],
) {
  const sx = w / 408;
  const sy = h / 292;
  const X = (v: number) => x + v * sx;
  const Y = (v: number, dy: number) => y + v * sy + dy;

  const [db, dt, dp] = offsets;
  ctx.fillStyle = MARK_COLOUR;

  // b — stem and bowl, then the counter cut back out.
  ctx.fillRect(X(0), Y(0, db), 70 * sx, 281 * sy);
  ctx.beginPath();
  ctx.ellipse(X(126), Y(198, db), 75.5 * sx, 87 * sy, 0, 0, Math.PI * 2);
  ctx.fill();

  /*
   * `destination-out` rather than filling with a background colour — the tile
   * is transparent, so painting the counter would leave an opaque blob where
   * the hole belongs.
   */
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.ellipse(X(99), Y(198, db), 29.5 * sx, 33 * sy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = MARK_COLOUR;

  // t — crossbar, then the stem over it.
  ctx.fillRect(X(196), Y(116, dt), 127 * sx, 55 * sy);
  ctx.fillRect(X(226), Y(58, dt), 67 * sx, 223 * sy);

  // The period.
  ctx.beginPath();
  ctx.ellipse(X(365), Y(250, dp), 42 * sx, 42 * sy, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Rendered frames, one per position in the loop.
 *
 * Module-level so it survives remounts — a route refresh shouldn't pay to
 * re-encode every frame. Filled lazily: the first pass through the loop
 * encodes, everything after is a lookup.
 */
const FRAME_CACHE: (string | undefined)[] = new Array(FRAMES);

export default function AnimatedFavicon() {
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) return;

    function iconLink(): HTMLLinkElement | null {
      if (link?.isConnected) return link;
      link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      return link;
    }

    const staticHref = link.href;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Centred horizontally; the headroom above is where the hop goes.
    const originX = (SIZE - MARK_W) / 2;
    const originY = (SIZE - MARK_H) / 2 + AMP / 2;

    let raf: number | undefined;
    let start = 0;
    let lastIndex = -1;

    function frame(now: number) {
      if (!ctx) return;
      if (!start) start = now;

      /*
       * The frame index is the entire animation state — position in the loop,
       * quantised to the cache's resolution. Skipping when it hasn't changed
       * means no work at all on rAF ticks landing inside the same frame, which
       * is most of them on a 120Hz display.
       */
      const index = Math.floor(((now - start) % LOOP) / (LOOP / FRAMES));

      if (index !== lastIndex) {
        lastIndex = index;

        let url = FRAME_CACHE[index];
        if (url === undefined) {
          const u = index / FRAMES;
          ctx.clearRect(0, 0, SIZE, SIZE);
          drawMark(ctx, originX, originY, MARK_W, MARK_H, [
            hop(u, PHASES[0]),
            hop(u, PHASES[1]),
            hop(u, PHASES[2]),
          ]);
          url = canvas.toDataURL("image/png");
          FRAME_CACHE[index] = url;
        }

        const el = iconLink();
        if (el) el.href = url;
      }

      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf !== undefined) cancelAnimationFrame(raf);
      raf = undefined;
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        const el = iconLink();
        if (el) el.href = staticHref;
      } else if (raf === undefined) {
        // Restart the clock, or the loop resumes wherever it would have been.
        start = 0;
        lastIndex = -1;
        raf = requestAnimationFrame(frame);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      const el = iconLink();
      if (el) el.href = staticHref;
    };
  }, []);

  return null;
}
