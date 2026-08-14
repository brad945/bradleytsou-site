"use client";

import { useEffect } from "react";

/**
 * The tab icon, with the `bt.` glyphs hopping in sequence — b, then t, then
 * the period.
 *
 * ## Why this is built the opposite way to the first attempt
 *
 * The first version drew smooth sub-pixel motion at up to 120fps and failed
 * twice over: the mark went soft, and it stayed laggy through every tuning
 * pass. Both had the same root cause, and it wasn't the frame rate.
 *
 * **Softness came from sub-pixel positions.** A glyph at y=7.34 is rasterised
 * across two rows of pixels with partial coverage in each. At 16 CSS px in a
 * tab strip that reads as blur, and no amount of resolution fixes it — the
 * static icon looked crisp precisely because Satori places it on whole pixels.
 * So this moves in **whole pixels only**, and every frame is as sharp as the
 * static one.
 *
 * **Lag came from volume.** 84–126 frames a second means that many favicon
 * writes, and browsers coalesce those; most were queued and dropped. Whole-px
 * motion needs far fewer — there are only four distinct heights — so this runs
 * **18 frames at ~14fps**, and every one of them actually paints.
 *
 * The result reads as a deliberate stepped animation, like a sprite, rather
 * than as smooth motion that didn't quite make it.
 *
 * ## The rest
 *
 * - **Needs JS.** The static `/icon` stays the real favicon; this replaces it
 *   after hydration, so JS-off loses nothing.
 * - **Stops when the tab is hidden** and restores the static icon — a tab
 *   frozen mid-hop reads as broken. Same on unmount, and it never starts under
 *   `prefers-reduced-motion`.
 * - **Re-acquires the icon link** rather than holding one reference.
 *   `AutoRefresh` refreshes the route every 300s and can replace that element;
 *   holding the original froze the tab after five minutes.
 * - Frames are drawn once into a module-level cache, so the whole animation
 *   costs 18 encodes for the life of the page.
 *
 * The mark is canvas primitives rather than `BtMark`'s SVG — rasterising that
 * per frame would mean an image load each time. Same 408x292 ink bounds, so
 * they stay one mark, but **two implementations of it**: a change to the
 * letterforms has to be made in both.
 */

/** The tab icon is 16 CSS px; 32 keeps it sharp on a 2x display. */
const SIZE = 32;

/** Mark size. Leaves 3px of headroom above for the hop. */
const MARK_W = 26;
const MARK_H = Math.round((MARK_W * 292) / 408);

/**
 * One glyph's hop, in whole pixels up from rest.
 *
 * Eight steps, and the shape is the easing — slow at the top (two frames at
 * -3) and quicker off the ground, which is what a bounce does. Written out
 * rather than computed from a sine, because the whole point is that these are
 * integers and a curve would reintroduce the sub-pixel values this exists to
 * avoid.
 */
const HOP = [0, -1, -2, -3, -3, -2, -1, 0];

/** How many steps each glyph lags the one before it. */
const STAGGER = 2;

/** Steps of stillness after the last glyph lands. */
const REST_STEPS = 7;

/** ms per step. ~14fps — high enough to read as motion, low enough that every
 *  frame is actually painted rather than coalesced away. */
const STEP_MS = 70;

/** Total steps in a cycle: the ripple, then the rest. */
const CYCLE = HOP.length + STAGGER * 2 + REST_STEPS;

/** `bright` white. */
const MARK_COLOUR = "#ffffff";

/** A glyph's offset at `step`, given how many steps it lags. */
function offsetAt(step: number, lag: number): number {
  const i = step - lag;
  return i >= 0 && i < HOP.length ? HOP[i] : 0;
}

/**
 * The `bt.` mark, each glyph offset vertically by whole pixels.
 *
 * `x` and `y` are rounded before use for the same reason the offsets are
 * integers: a fractional origin would put every glyph back on a sub-pixel
 * boundary regardless of how clean the offsets are.
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

/** One entry per step. Module-level, so a route refresh doesn't re-encode. */
const FRAME_CACHE: (string | undefined)[] = new Array(CYCLE);

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

    const originX = (SIZE - MARK_W) / 2;
    // The 3px of hop travels upward, so rest sits that much lower.
    const originY = (SIZE - MARK_H) / 2 + 2;

    let step = 0;
    let timer: number | undefined;

    function tick() {
      if (!ctx) return;

      let url = FRAME_CACHE[step];
      if (url === undefined) {
        ctx.clearRect(0, 0, SIZE, SIZE);
        drawMark(ctx, originX, originY, MARK_W, MARK_H, [
          offsetAt(step, 0),
          offsetAt(step, STAGGER),
          offsetAt(step, STAGGER * 2),
        ]);
        url = canvas.toDataURL("image/png");
        FRAME_CACHE[step] = url;
      }

      const el = iconLink();
      if (el) el.href = url;

      step = (step + 1) % CYCLE;
      timer = window.setTimeout(tick, STEP_MS);
    }

    function stop() {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        const el = iconLink();
        if (el) el.href = staticHref;
      } else if (timer === undefined) {
        step = 0;
        tick();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    tick();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      const el = iconLink();
      if (el) el.href = staticHref;
    };
  }, []);

  return null;
}
