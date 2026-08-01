import { ImageResponse } from "next/og";

/**
 * Favicon, generated rather than checked in as a binary.
 *
 * The monogram over the Steam-blue column colour, so the tab icon is drawn
 * from the same tokens as the page instead of being a file that silently
 * drifts out of step with the palette. Next builds this once at compile time.
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
          alignItems: "center",
          justifyContent: "center",
          // `hero` and `copy` from tailwind.config.ts. Literal here because
          // this runs in the edge runtime and can't import the config.
          background: "#1b2838",
          color: "#c7d5e0",
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: -1,
        }}
      >
        BT
      </div>
    ),
    size,
  );
}
