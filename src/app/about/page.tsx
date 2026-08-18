import type { Metadata } from "next";
import Achievements from "@/components/Achievements";
import Inventory from "@/components/Inventory";
import Reviews from "@/components/Reviews";
import SiteNav from "@/components/SiteNav";
import { getGitHubSnapshot } from "@/lib/github";
import { githubUsername, profile } from "@/lib/profile-data";

/**
 * `/about` — the other half of the profile.
 *
 * `/` is the formal one: roles, repos, the things a recruiter reads. This is
 * what he actually does, likes and plays, and it's built out of **the Steam
 * surfaces the profile page didn't claim** — Reviews, Inventory, Achievements.
 *
 * That's the idea rather than a flourish. The profile page earns its
 * credibility by being all data, and a wall of "I'm passionate about…" here
 * would break that spell on the same site. Everything personal goes in a
 * Steam-shaped container.
 *
 * **One column, not the profile's 2fr/1fr split.** These panels are dense and
 * self-contained, and there's no live sidebar data that belongs beside them —
 * a sidebar here would be furniture. It still sits in the same centred
 * `max-w-profile` block, so it reads as the same site.
 *
 * The snapshot is fetched for one reason, as on `/play`: `SiteNav` hides its
 * whole right-hand block when `stats` is null, so without it the nav here
 * would be visibly shorter than the nav everywhere else. Same ISR window, so
 * it's the same cached response rather than another round of calls.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: `About — ${profile.name}`,
  description: "What I actually do, like and play.",
  alternates: { canonical: "/about" },
};

export default async function About() {
  const snapshot = await getGitHubSnapshot(githubUsername);

  return (
    <>
      <SiteNav stats={snapshot.stats} />

      <main className="mx-auto w-full max-w-profile bg-hero px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4">
        {/*
          A heading, because unlike `/` this page has no profile header to
          introduce it — landing straight on a Reviews panel would give no
          indication of whose reviews they are or why they're here.
        */}
        <header className="px-1 pb-1 pt-3">
          <h1 className="t-display">About</h1>
          <p className="mt-1 max-w-[52ch] text-[16px] font-medium leading-snug text-copy">
            The profile is the formal half. This is the rest of it.
          </p>
        </header>

        <div className="mt-3 flex flex-col gap-3">
          {/*
            Reviews first: it's the one that carries the most personality per
            inch, and it sets the tone for reading the other two as jokes with
            real data in them rather than as literal game UI.
          */}
          <Reviews />
          <Inventory />
          <Achievements />
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
          <span>
            Layout inspired by Steam profiles. Not affiliated with Valve.
          </span>
        </footer>
      </main>
    </>
  );
}
