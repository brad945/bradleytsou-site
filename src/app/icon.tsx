import { ImageResponse } from "next/og";
import BtMark from "@/components/BtMark";

/**
 * Favicon: Bradley's "bt." mark, generated rather than checked in as a binary.
 *
 * It replaced a "BT" monogram, which was two capitals in whatever face the
 * edge runtime defaults to — a placeholder, not a mark. The geometry lives in
 * `BtMark`, shared with the nav wordmark; this file is only the tile and the
 * placement.
 *
 * Colours are `base` and `bright` from tailwind.config.ts, matching the
 * artwork's own black field and white mark. Literal here because this runs in
 * the edge runtime and can't import the config — and `fill` is passed
 * explicitly because Satori can't resolve `currentColor`.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#000000", // `base`
        }}
      >
        {/*
         * Placed, not centred. Centring the mark's bounding box looks jammed
         * against the left edge, because the box's right side is set by the
         * period, alone down in the corner — so beside the b and t there is
         * nothing on the right, while the b's flat stem runs hard into the
         * margin.
         *
         * The ink's centre of mass is at 39.8% across, not 50%. Pure mass
         * centring (left 6) puts the period on the edge, so this splits the
         * difference: left 5, right 2. Vertical stays box-centred — the mark
         * is only lopsided horizontally.
         *
         * 25x18 of the 32px tile. The mark is 1.4:1, so width sets the size
         * and the leftover is vertical by definition.
         */}
        <BtMark
          width={25}
          height={18}
          fill="#ffffff" // `bright`
          style={{ position: "absolute", left: 5, top: 7 }}
        />
      </div>
    ),
    size,
  );
}
