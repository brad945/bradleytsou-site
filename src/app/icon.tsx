import { ImageResponse } from "next/og";

/**
 * Favicon: Bradley's "bt." mark, generated rather than checked in as a binary.
 *
 * It replaced a "BT" monogram set in the default face. The mark is a heavy
 * geometric lowercase and no webfont available here gets near it, so — as with
 * `DvdLogo` in ProfileHeader, for the same reason — the letterforms are drawn
 * as primitives instead of typeset. That also keeps it crisp at 16px, where a
 * downscaled bitmap of a mark this bold turns to mush.
 *
 * Every coordinate below is measured off the artwork Bradley supplied, then
 * translated so the viewBox is the mark's own ink bounds (408x292) with no
 * padding baked in — padding is the placement below, so the mark can be
 * resized by changing the svg width/height alone. Two things are easy to get
 * wrong and both are load-bearing:
 *   1. **The b's bowl is an ellipse, not a circle** — 75.5 x 87, noticeably
 *      taller than wide. The dot beside it *is* round (r 42), so this is the
 *      mark's own drawing, not a squashed screenshot. Circularising the bowl
 *      reads as a different, lighter letter.
 *   2. **The counter is not concentric with the bowl.** Its left edge sits on
 *      the stem's right edge (x 70) rather than centring in the bowl, which is
 *      what holds the ring an even ~73 wide on the right — the same weight as
 *      the 70-wide stem. Centre it and the right ring thins and the b looks
 *      lopsided.
 *
 * Colours are `base` and `bright` from tailwind.config.ts, matching the
 * artwork's own black-field/white-mark. Literal here because this runs in the
 * edge runtime and can't import the config.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BLACK = "#000000"; // `base`
const WHITE = "#ffffff"; // `bright`

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: BLACK,
        }}
      >
        {/*
         * Placed, not centred. Centring the mark's bounding box looks jammed
         * against the left edge, because the box's right side is set by the
         * period down in the corner — so beside the b and t there is nothing
         * on the right, while the b's flat stem runs hard into the margin.
         *
         * The ink's centre of mass is at 39.8% across, not 50%. Pure mass
         * centring (left 6) puts the period on the edge, so this splits the
         * difference: left 5, right 2. Vertical stays box-centred — the mark
         * is only lopsided horizontally.
         *
         * 25x18 of the 32px tile. The mark is 1.4:1, so width sets the size
         * and the leftover is vertical by definition.
         */}
        <svg
          width="25"
          height="18"
          viewBox="0 0 408 292"
          style={{ position: "absolute", left: 5, top: 7 }}
        >
          {/* b: stem, then the bowl, then the counter punched back out in the
              field colour. Drawn in this order — the counter must land after
              the bowl, and nothing to its right overlaps it. */}
          <rect x="0" y="0" width="70" height="281" fill={WHITE} />
          <ellipse cx="126" cy="198" rx="75.5" ry="87" fill={WHITE} />
          <ellipse cx="99" cy="198" rx="29.5" ry="33" fill={BLACK} />

          {/* t: crossbar under the ascender, then the stem over it. */}
          <rect x="196" y="116" width="127" height="55" fill={WHITE} />
          <rect x="226" y="58" width="67" height="223" fill={WHITE} />

          {/* The period, sitting 11 below the baseline the two stems share. */}
          <circle cx="365" cy="250" r="42" fill={WHITE} />
        </svg>
      </div>
    ),
    size,
  );
}
