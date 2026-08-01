import { ImageResponse } from "next/og";
import { profile } from "@/lib/profile-data";

/**
 * The card LinkedIn, iMessage, Slack and Twitter show when the link is shared.
 *
 * Without this the site previews as a bare text link, which for a personal
 * site is the difference between someone clicking and not. Drawn here rather
 * than checked in as a PNG so it tracks `profile-data` — change a role and the
 * preview follows on the next build.
 *
 * Deliberately plain: name, tagline, current roles. No screenshot of the page,
 * which would be unreadable at preview size.
 */
export const runtime = "edge";
export const alt = `${profile.name} — ${profile.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          // Page black with the column blue, same relationship as the site.
          background: "#000000",
          borderLeft: "24px solid #1b2838",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: -2,
          }}
        >
          {profile.name}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#a5bbd4",
          }}
        >
          {profile.tagline}
        </div>

        {profile.currentFocus.map((line) => (
          <div
            key={line.text}
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 30,
              color: "#8f98a0",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>
    ),
    size,
  );
}
