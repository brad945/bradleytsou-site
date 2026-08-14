import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { getGitHubSnapshot } from "@/lib/github";
import { githubUsername, profile } from "@/lib/profile-data";

/**
 * `/play` — deliberately empty for now.
 *
 * It exists so the nav's Play item can be a real link instead of a dim
 * placeholder. Everything but the message is borrowed from the profile page,
 * so it reads as the same site rather than a stub someone forgot: the same
 * nav, the same centred `max-w-profile` column on the black surround, the same
 * panel and panel-bar, and the same footer disclaimer.
 *
 * The snapshot is fetched for one reason — `SiteNav` hides its whole right-hand
 * block when `stats` is null, so without it the nav here would be visibly
 * shorter than the nav on the profile page. Same ISR window, so it's the same
 * cached response rather than a second round of calls.
 */
/** Literal, not the imported constant — Next requires this statically
 *  analyzable, and it matches the profile page's window. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: `Play — ${profile.name}`,
  alternates: { canonical: "/play" },
};

export default async function Play() {
  const snapshot = await getGitHubSnapshot(githubUsername);

  return (
    <>
      <SiteNav stats={snapshot.stats} />

      <main className="mx-auto w-full max-w-profile bg-hero px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4">
        <section aria-labelledby="play-heading" className="panel">
          <div className="panel-bar">
            <h1 id="play-heading" className="panel-bar-title">
              Play
            </h1>
            <span className="panel-bar-meta">Nothing here yet</span>
          </div>

          {/*
            `min-h` rather than a fixed height: the page has one line on it, and
            a panel sized to that line reads as a strip rather than as a page.
            This gives it room without pinning it to a number that would need
            revisiting the moment anything lands here.
          */}
          <div className="flex min-h-[320px] items-center justify-center px-6 py-16">
            <p className="max-w-[46ch] text-center text-[17px] leading-relaxed text-copy">
              All of these brought to you and built by yours truly (Claude
              code).
            </p>
          </div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
          <span>
            Layout inspired by Steam profiles. Not affiliated with Valve.
          </span>
        </footer>
      </main>
    </>
  );
}
