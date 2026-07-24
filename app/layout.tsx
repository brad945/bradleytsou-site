import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/profile-data";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-base">
        {/* Static ambient gradient. Does not move, does not react to scroll. */}
        <div className="pointer-events-none fixed inset-0 bg-nebula-glow" aria-hidden />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
