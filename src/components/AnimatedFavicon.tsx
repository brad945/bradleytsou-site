"use client";

import { useEffect } from "react";

/**
 * The tab icon, bouncing.
 *
 * The `bt.` mark drifts around a 32x32 box and bounces off the walls — the
 * avatar's DVD-screensaver movement, in the tab. White throughout: the motion
 * is the point, not the colour cycling the avatar's logo does.
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
 * ## What this costs, honestly
 *
 * - **It needs JS**, so the static `/icon` route stays as the real favicon and
 *   this replaces it after hydration. With JS off, the tab shows the static
 *   mark and nothing is lost.
 * - **10fps, not 60.** Each frame is a canvas export plus a DOM write, and the
 *   tab strip is 16 CSS px — past ~10fps it costs more than it shows. That
 *   also matches the original screensaver's chunky framerate, which is what
 *   the avatar's `steps()` bounce is pinned to.
 * - **It stops when the tab is hidden.** `requestAnimationFrame` is throttled
 *   or halted in background tabs, so this listens for `visibilitychange` and
 *   restores the static icon on the way out — a tab frozen mid-bounce on a
 *   random colour looks broken rather than paused.
 *
 * ## The mark
 *
 * Drawn as canvas primitives rather than reusing `BtMark`: that's an SVG
 * component, and rasterising it per frame would mean an `Image` load and
 * `drawImage` for each one. The geometry is the same, scaled from the same
 * 408x292 ink bounds, so the two stay recognisably one mark — but **they are
 * two implementations of it**, and a change to the letterforms has to be made
 * in both.
 */

/** The tab icon is 16 CSS px; 32 keeps it sharp on a 2x display. */
const SIZE = 32;

/**
 * Mark size inside that box — 21x15, leaving 11x17 to travel in.
 *
 * A trade, and both ends are worse: smaller buys more bounce but closes up the
 * b's counter, which is most of what makes the mark read as "bt" rather than a
 * blob; bigger keeps the counter open but leaves too little room to see it
 * move. 21 is where the hole survives and the travel is still obvious.
 */
const MARK_W = 21;
const MARK_H = Math.round((MARK_W * 292) / 408);

/** Frames per second. See the note above on why this isn't higher. */
const FPS = 10;

/** Pixels per frame on each axis. Deliberately unequal, so the path doesn't
 *  retrace itself into a short loop the way matching speeds would. */
const VX = 1.1;
const VY = 0.9;

/**
 * `bright` white, and it stays white.
 *
 * The avatar's DVD logo cycles a screensaver palette on wall contact and this
 * did too at first; Bradley wanted the bounce without the colour. It also
 * suits the tile better — the favicon is transparent, so the mark sits on the
 * browser's own tab strip rather than on a field of ours, and a colour that
 * shifts underneath unpredictable chrome is a worse bet than one that doesn't.
 */
const MARK_COLOUR = "#ffffff";

/**
 * The `bt.` mark, scaled from its 408x292 ink bounds into `w` x `h` at (x, y).
 * Mirrors `BtMark`'s geometry — see the note above about the duplication.
 */
function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
) {
  const sx = w / 408;
  const sy = h / 292;
  const X = (v: number) => x + v * sx;
  const Y = (v: number) => y + v * sy;

  ctx.fillStyle = colour;

  // b: stem, bowl, then the counter punched back out.
  ctx.fillRect(X(0), Y(0), 70 * sx, 281 * sy);
  ctx.beginPath();
  ctx.ellipse(X(126), Y(198), 75.5 * sx, 87 * sy, 0, 0, Math.PI * 2);
  ctx.fill();

  /*
   * The counter is cut with `destination-out` rather than filled with the
   * background colour — the tile is transparent, so painting it would leave an
   * opaque blob where the hole should be.
   */
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.ellipse(X(99), Y(198), 29.5 * sx, 33 * sy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // t: crossbar, then the stem over it.
  ctx.fillStyle = colour;
  ctx.fillRect(X(196), Y(116), 127 * sx, 55 * sy);
  ctx.fillRect(X(226), Y(58), 67 * sx, 223 * sy);

  // The period.
  ctx.beginPath();
  ctx.ellipse(X(365), Y(250), 42 * sx, 42 * sy, 0, 0, Math.PI * 2);
  ctx.fill();
}

export default function AnimatedFavicon() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) return;

    // Restored whenever the animation stops, so the tab never sits on a
    // half-drawn frame.
    const staticHref = link.href;

    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Respect the same preference the rest of the site does. */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let x = 3;
    let y = 4;
    let dx = VX;
    let dy = VY;
    let timer: number | undefined;

    function frame() {
      if (!ctx) return;

      x += dx;
      y += dy;

      // Reverse at each wall. Clamped as well as reversed, so a frame that
      // overshoots doesn't leave the mark stuck outside the box.
      if (x <= 0 || x >= SIZE - MARK_W) {
        dx = -dx;
        x = Math.min(Math.max(x, 0), SIZE - MARK_W);
      }
      if (y <= 0 || y >= SIZE - MARK_H) {
        dy = -dy;
        y = Math.min(Math.max(y, 0), SIZE - MARK_H);
      }

      ctx.clearRect(0, 0, SIZE, SIZE);
      drawMark(ctx, x, y, MARK_W, MARK_H, MARK_COLOUR);
      if (link) link.href = canvas.toDataURL("image/png");

      timer = window.setTimeout(frame, 1000 / FPS);
    }

    function stop() {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    }

    function onVisibility() {
      if (document.hidden) {
        stop();
        // A tab frozen mid-bounce reads as broken; the static mark reads as a
        // normal favicon.
        if (link) link.href = staticHref;
      } else if (timer === undefined) {
        frame();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    frame();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      if (link) link.href = staticHref;
    };
  }, []);

  return null;
}
