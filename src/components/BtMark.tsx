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
  glyphClassName,
}: {
  width: number;
  height: number;
  /** Satori can't resolve `currentColor`, so the favicon passes a literal. */
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
  /**
   * Per-glyph classes, for animating the three letterforms independently.
   *
   * Passing this wraps each glyph in its own `<g>`. **Omitting it leaves the
   * markup exactly as it was**, ungrouped — that path is what `app/icon.tsx`
   * renders through Satori, whose SVG support is a subset, and there's no
   * reason to make the favicon the test of whether it handles nested groups.
   *
   * Anything animating these should read the note on `glyph-hop` in
   * `tailwind.config.ts` first: transforms on an SVG child are in **viewBox
   * user units, not CSS pixels**, and the glyphs sit flush against the
   * viewBox edges, so any upward movement clips without `overflow-visible`.
   */
  glyphClassName?: { b?: string; t?: string; dot?: string };
}) {
  /*
   * Two whole returns rather than one svg with conditional children, and the
   * duplication is deliberate.
   *
   * **Satori cannot render React Fragments** — it walks the element tree and
   * tries to stringify the fragment's Symbol type, which throws
   * `Cannot convert a Symbol value to a string` and turns `/icon` into a 500.
   * Any shared structure here needs either a ternary or a grouping element,
   * and both put a Fragment in the path Satori takes.
   *
   * So the ungrouped branch below is exactly the markup that has always
   * worked, with nothing between it and the svg. The geometry is still stated
   * once — it's in `B` and in these literal numbers, and a change has to be
   * made in both branches.
   */
  if (glyphClassName) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 408 292"
        style={style}
        className={className}
        aria-hidden
      >
        <g className={glyphClassName.b}>
          <path d={B} fill={fill} />
        </g>
        {/* t: crossbar, then the stem over it. */}
        <g className={glyphClassName.t}>
          <rect x="196" y="116" width="127" height="55" fill={fill} />
          <rect x="226" y="58" width="67" height="223" fill={fill} />
        </g>
        {/* The period, sitting 11 below the baseline the two stems share. */}
        <g className={glyphClassName.dot}>
          <circle cx="365" cy="250" r="42" fill={fill} />
        </g>
      </svg>
    );
  }

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
