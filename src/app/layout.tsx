import type { Metadata, Viewport } from "next";
import { Gabarito, JetBrains_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import { profile, siteOrigin } from "@/lib/profile-data";

/**
 * Steam's own face is Motiva Sans, and the Tailwind stacks now name it first
 * so a visitor who already has it installed sees it. It can't be loaded here:
 * it's Typotheque's, licensed per-use, and self-hosting the file needs a paid
 * webfont licence. That makes it a local-only nicety, not the delivered font.
 *
 * Open Sans is what actually renders for essentially everyone. Bradley picked
 * it from a side-by-side of six free faces set in this page's own headings.
 * One family for display and body, same as Steam.
 *
 * Note its weight range starts at 300 — there is no 200. Every heading that
 * asked for `font-extralight` was moved to `font-light` rather than left to
 * clamp silently, so the CSS says the weight that actually renders.
 */
const sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Signage face, used only by the "Coming soon" cover.
 *
 * Deliberately outside the page's own typography, which is one family at light
 * weights with no tracked capitals — the rules that make the rest of this read
 * as Steam. A hoarding over the profile isn't part of that page, so it gets its
 * own face; it would be wrong anywhere else here, and `font-sign` exists so
 * that stays visible at the call site.
 *
 * **This is a stand-in for BB Casual Pro Medium, which Bradley asked for and
 * the site cannot load.** BB Casual is Bold Studio's, sold per-licence through
 * MyFonts and Fontspring — serving it needs a paid *webfont* licence, and a
 * desktop licence for design work doesn't cover embedding. Same wall as Motiva
 * Sans above. If that licence is ever bought, drop the .woff2 in and swap this
 * for `next/font/local`; don't point an @font-face at a copy from a free-font
 * aggregator, which is what those sites almost always are.
 *
 * Gabarito is the closest free face: a contemporary geometric sans with real
 * stroke modulation rather than the dead-even strokes of Outfit or Poppins,
 * which is the trait BB Casual is built around. It carries a true Medium, so
 * the weight Bradley named survives the substitution.
 */
const sign = Gabarito({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-sign",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  // Just the name. The handle used to be appended and said nothing the name
  // didn't — a tab is narrow, and "Bradley Tsou" is the whole identity here.
  title: profile.name,
  description: profile.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    title: profile.name,
    description: profile.tagline,
    type: "profile",
    url: siteOrigin,
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1b2838", // `hero`, the column colour — matches the browser chrome to the page
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${sign.variable}`}
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
