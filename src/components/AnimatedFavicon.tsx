"use client";

import { useEffect } from "react";

/**
 * The tab icon: each glyph of `bt.` pops up and drops back, in turn.
 *
 * ## Six frames, written out
 *
 * The animation is a literal table — b up, b down, t up, t down, period up,
 * period down — rather than offsets sampled from a curve. Two earlier versions
 * did it the other way and both failed for the same reason.
 *
 * **Smooth motion doesn't survive this medium.** Sub-pixel positions rasterise
 * across two rows of pixels with partial coverage in each, which at 16 CSS px
 * in a tab strip reads as blur; the static icon looks crisp precisely because
 * Satori places it on whole pixels. And volume doesn't help: at 84-126 frames
 * a second, browsers coalesce favicon writes and quietly drop most of them,
 * which is why several passes of raising the frame rate changed nothing.
 *
 * So this is four distinct images shown in six slots, each on a whole pixel.
 * It reads as a deliberate stepped animation rather than as smooth motion that
 * didn't arrive — and every frame actually paints.
 *
 * ## The rest
 *
 * - **Needs JS.** The static `/icon` stays the real favicon; this replaces it
 *   after hydration, so JS-off loses nothing.
 * - **Stops when the tab is hidden** and restores the static icon — a tab
 *   frozen mid-hop reads as broken. Same on unmount, and it never starts under
 *   `prefers-reduced-motion`.
 * - **Replaces the icon element** each frame rather than reassigning its href.
 *   Chrome caches favicons by URL and can skip a swap back to one it has
 *   already decoded, which made hops appear on some cycles and not others.
 *   Replacing also means `AutoRefresh` re-rendering the head every 300s can't
 *   leave this writing to a detached node.
 *
 * The mark is canvas primitives rather than `BtMark`'s SVG — rasterising that
 * per frame would mean an image load each time. Same 408x292 ink bounds, so
 * they stay one mark, but **two implementations of it**: a change to the
 * letterforms has to be made in both.
 */

/** The tab icon is 16 CSS px; 32 keeps it sharp on a 2x display. */
const SIZE = 32;

/** Mark size, leaving headroom above for the hop. */
const MARK_W = 26;
const MARK_H = Math.round((MARK_W * 292) / 408);

/** How far a glyph rises, in whole pixels. Fractions are what caused the blur.  */
const LIFT = -3;

/**
 * The whole animation: `[b, t, period]` offsets, and how long to hold each.
 *
 * Six frames, one up and one down per glyph. The three down frames are the
 * same image, so this is four distinct renders — `FRAME_CACHE` is keyed by the
 * offsets rather than the index, so it encodes four PNGs, not six.
 *
 * Every hop holds for the same `STEP`. They ran 110/90/110/90/110 once and
 * that unevenness is what made the loop feel arbitrary — at six frames there's
 * no room for a rhythm to be subtle, it just reads as a mistake.
 *
 * The last frame holds `PAUSE` instead. That's the beat between cycles, and
 * keeping it as a duration rather than extra frames is why the pause costs
 * nothing.
 */
const STEP = 120;
const PAUSE = 500;

const FRAMES: { offsets: [number, number, number]; hold: number }[] = [
  { offsets: [LIFT, 0, 0], hold: STEP },
  { offsets: [0, 0, 0], hold: STEP },
  { offsets: [0, LIFT, 0], hold: STEP },
  { offsets: [0, 0, 0], hold: STEP },
  { offsets: [0, 0, LIFT], hold: STEP },
  { offsets: [0, 0, 0], hold: PAUSE },
];

/** `bright` white. */
const MARK_COLOUR = "#ffffff";

/**
 * The `bt.` mark, each glyph offset vertically by whole pixels.
 *
 * Every coordinate is rounded before use, for the same reason the offsets are
 * integers: a fractional origin would put the glyphs back on sub-pixel
 * boundaries however clean the offsets are.
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
  const ox = Math.round(x);
  const oy = Math.round(y);
  const X = (v: number) => ox + Math.round(v * sx);
  const Y = (v: number, dy: number) => oy + Math.round(v * sy) + dy;

  const [db, dt, dp] = offsets;
  ctx.fillStyle = MARK_COLOUR;

  // b — stem and bowl, then the counter cut back out.
  ctx.fillRect(X(0), Y(0, db), Math.round(70 * sx), Math.round(281 * sy));
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
  ctx.fillRect(X(196), Y(116, dt), Math.round(127 * sx), Math.round(55 * sy));
  ctx.fillRect(X(226), Y(58, dt), Math.round(67 * sx), Math.round(223 * sy));

  // The period.
  ctx.beginPath();
  ctx.ellipse(X(365), Y(250, dp), 42 * sx, 42 * sy, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Keyed by offsets, not frame index, so the three identical down frames share
 * one encode. Module-level, so a route refresh doesn't re-render them.
 */
const FRAME_CACHE = new Map<string, string>();

export default function AnimatedFavicon() {
  useEffect(() => {
    const initial = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!initial) return;

    const staticHref = initial.href;

    /*
     * Replaces the icon element rather than reassigning its href.
     *
     * Reassigning looked correct and behaved erratically: this cycles four
     * repeating data URLs, and Chrome caches favicons by URL, so a swap back
     * to one it has already decoded can be skipped entirely. The result was
     * hops that appeared some cycles and not others — which reads as random
     * rather than as broken, and is why it wasn't obvious.
     *
     * A fresh element with no history is unambiguous, and it also removes the
     * need to re-acquire a stale reference after `AutoRefresh` re-renders the
     * head: whatever is in the document when this runs gets replaced.
     */
    function setIcon(href: string) {
      const next = document.createElement("link");
      next.rel = "icon";
      next.type = "image/png";
      next.sizes = "32x32";
      next.href = href;
      document
        .querySelectorAll('link[rel~="icon"]')
        .forEach((el) => el.remove());
      document.head.appendChild(next);
    }

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const originX = (SIZE - MARK_W) / 2;
    // The lift travels upward, so rest sits that much lower in the tile.
    const originY = (SIZE - MARK_H) / 2 + 2;

    let i = 0;
    let timer: number | undefined;

    function tick() {
      if (!ctx) return;

      const { offsets, hold } = FRAMES[i];
      const key = offsets.join(",");

      let url = FRAME_CACHE.get(key);
      if (url === undefined) {
        ctx.clearRect(0, 0, SIZE, SIZE);
        drawMark(ctx, originX, originY, MARK_W, MARK_H, offsets);
        url = canvas.toDataURL("image/png");
        FRAME_CACHE.set(key, url);
      }

      setIcon(url);

      i = (i + 1) % FRAMES.length;
      timer = window.setTimeout(tick, hold);
    }

    function stop() {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        setIcon(staticHref);
      } else if (timer === undefined) {
        i = 0;
        tick();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    tick();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      setIcon(staticHref);
    };
  }, []);

  return null;
}
