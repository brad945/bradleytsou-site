import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Mulish } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/profile-data";

/**
 * Steam's own face is Motiva Sans, and the Tailwind stacks now name it first
 * so a visitor who already has it installed sees it. It can't be loaded here:
 * it's Typotheque's, licensed per-use, and self-hosting the file needs a paid
 * webfont licence. That makes it a local-only nicety, not the delivered font.
 *
 * Mulish is what actually renders for essentially everyone — closest free
 * match on proportions, and it carries the light weights the big numbers need.
 * One family for display and body, same as Steam.
 */
const sans = Mulish({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.handle.replace("@", "")}`,
  description: profile.tagline,
  openGraph: {
    title: profile.name,
    description: profile.tagline,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0d11",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      style={
        {
          "--font-display": "var(--font-sans)",
          "--font-body": "var(--font-sans)",
        } as React.CSSProperties
      }
    >
      <body className="min-h-screen bg-base">
        {/* Starfield only. The nebula glow was a stack of radial gradients
            and went with the rest of them. */}
        <div
          className="pointer-events-none fixed inset-0 bg-starfield opacity-70"
          style={{ backgroundSize: "760px 760px" }}
          aria-hidden
        />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
