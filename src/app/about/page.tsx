import type { Metadata } from "next";
import Achievements from "@/components/Achievements";
import Inventory from "@/components/Inventory";
import Portfolio from "@/components/Portfolio";
import Reviews from "@/components/Reviews";
import SiteNav from "@/components/SiteNav";
import { getFeaturedRepos, getGitHubSnapshot } from "@/lib/github";
import { getSteamPlaytime } from "@/lib/steam";
import { aboutText, reviews } from "@/lib/about-data";
import {
  featuredRepos,
  githubUsername,
  profile,
  steamId64,
} from "@/lib/profile-data";

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
  /*
   * Live hours for any review that names a Steam game, so a review can't sit
   * on a written number while the Favorite Game panel shows a fetched one.
   * Deduped, because two reviews of the same game would otherwise be two
   * identical calls.
   */
  const appIds = Array.from(
    new Set(reviews.map((r) => r.appId).filter((id): id is number => !!id)),
  );

  /*
   * `getFeaturedRepos` is here for Portfolio, which wants the same live
   * language and privacy flags the rows on `/` get. Same call, same cache
   * window — the two pages share the response rather than each fetching.
   */
  const [snapshot, featured, ...times] = await Promise.all([
    getGitHubSnapshot(githubUsername),
    getFeaturedRepos(featuredRepos),
    ...appIds.map((id) => getSteamPlaytime(steamId64, id)),
  ]);

  const playtime = Object.fromEntries(
    appIds
      .map((id, i) => [id, times[i]] as const)
      .filter(
        (
          entry,
        ): entry is readonly [number, NonNullable<(typeof times)[number]>] =>
          !!entry[1],
      ),
  );

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
            **Reviews and Inventory are hidden, not deleted**, at Bradley's
            request — both are still written in my voice rather than his, and
            hiding them is what let the nav item come out of grey. The
            components, their data and the Steam playtime this page fetches for
            the CS2 review are all still here; uncomment the two lines and
            they're back exactly as they were.

            Portfolio leads now. It was under Reviews because it's the one
            panel here that would also be on a CV, and the page opened with
            the parts of him that aren't — with those gone there's nothing for
            it to sit under.
          */}
          {/*
            About: the one panel on this site that is meant to be prose.
            Everything else avoids it on purpose — paragraphs of self-
            description sitting beside panels of fetched numbers borrow their
            credibility — and this earns its place by being plainly labelled as
            what it is rather than dressed up as data.

            Rendered here rather than as its own component because it is a
            heading and a list of paragraphs with no logic in it. Give it a
            file the moment it needs one.
          */}
          <section aria-labelledby="about-panel-heading" className="panel">
            <div className="panel-bar">
              <h2 id="about-panel-heading" className="panel-bar-title">
                About
              </h2>
            </div>
            <div className="flex flex-col gap-3 p-5">
              {aboutText.map((para) => (
                <p key={para} className="t-body max-w-[68ch]">
                  {para}
                </p>
              ))}
            </div>
          </section>
          {/* <Reviews playtime={playtime} /> */}
          <Portfolio featured={featured} />
          {/* <Inventory /> */}
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
