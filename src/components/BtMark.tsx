/**
 * Bradley's "bt." mark, as vector primitives.
 *
 * Shared by the favicon (`src/app/icon.tsx`) and the nav wordmark, so the
 * geometry is stated once. Every coordinate is measured off the artwork he
 * supplied and translated so the viewBox is the mark's own ink bounds
 * (408x292) with no padding baked in — callers place it. Checked against the
 * source: 1% of ink pixels differ, all of it antialiasing along the curves.
 *
 * It's drawn rather than typeset for the same reason `DvdLogo` is: the
 * letterforms are a heavy geometric lowercase and no webfont available here
 * gets near them. That also keeps it crisp at 16px, where a downscaled bitmap
 * of a mark this bold turns to mush.
 *
 * Three measurements are load-bearing:
 *   1. **The b's bowl is an ellipse, not a circle** — 75.5 x 87, noticeably
 *      taller than wide. The period beside it *is* round (r 42), so this is
 *      the mark's own drawing, not a squashed screenshot. Circularise the bowl
 *      and it reads as a different, lighter letter.
 *   2. **The counter is not concentric with the bowl.** Its left edge sits on
 *      the stem's right edge (x 70) rather than centring in the bowl, which is
 *      what holds the ring an even ~73 wide on the right — the same weight as
 *      the 70-wide stem. Centre it and the right ring thins and the b looks
 *      lopsided.
 *   3. **The counter is a real hole, not a circle painted in the background
 *      colour.** That's what lets the mark sit on the nav's `chrome` bar and
 *      on the favicon's black tile without being told which it's on. It works
 *      by winding: the stem and bowl subpaths run clockwise and the counter
 *      anticlockwise, so under the default nonzero fill rule the counter
 *      cancels to zero while the stem/bowl overlap still fills. Reverse a
 *      sweep flag and the hole closes up or the overlap punches through.
 */

/** Mark's own proportions, for callers sizing it. 408 / 292 = 1.397. */
export const BT_MARK_ASPECT = 408 / 292;

const B = [
  // Stem, clockwise.
  "M0 0 H70 V281 H0 Z",
  // Bowl, clockwise (sweep 1) from its left point.
  "M50.5 198 A75.5 87 0 1 1 201.5 198 A75.5 87 0 1 1 50.5 198 Z",
  // Counter, anticlockwise (sweep 0) — this is the hole.
  "M69.5 198 A29.5 33 0 1 0 128.5 198 A29.5 33 0 1 0 69.5 198 Z",
].join(" ");

export default function BtMark({
  width,
  height,
  fill = "currentColor",
  style,
  className,
}: {
  width: number;
  height: number;
  /** Satori can't resolve `currentColor`, so the favicon passes a literal. */
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 408 292"
      style={style}
      className={className}
      aria-hidden
    >
      <path d={B} fill={fill} />

      {/* t: crossbar, then the stem over it. */}
      <rect x="196" y="116" width="127" height="55" fill={fill} />
      <rect x="226" y="58" width="67" height="223" fill={fill} />

      {/* The period, sitting 11 below the baseline the two stems share. */}
      <circle cx="365" cy="250" r="42" fill={fill} />
    </svg>
  );
}
