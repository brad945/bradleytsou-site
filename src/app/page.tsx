import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";
import BoardedUp from "@/components/BoardedUp";
import Experience from "@/components/Experience";
import { FavoriteProject } from "@/components/ItemShowcase";
import ProfileHeader from "@/components/ProfileHeader";
import SiteNav from "@/components/SiteNav";
import Sidebar from "@/components/Sidebar";
// Parked until GitHub Discussions is enabled and giscus IDs are real.
// See components/Comments.tsx.
// import Comments from "@/components/Comments";

import { getDevEvalStats } from "@/lib/deveval";
import {
  getContributions,
  getGitHubSnapshot,
  getFeaturedRepos,
  getLanguages,
  getLastPush,
  REVALIDATE_SECONDS,
} from "@/lib/github";
import {
  githubUsername,
  FAVORITE_REPO,
  featuredRepos,
  privacyScreen,
  SITE_REPO_NAME,
  siteRepoUrl,
} from "@/lib/profile-data";

/** ISR window for the whole page — matches the feed's fetch revalidate. */
export const revalidate = 300;

export default async function Home() {
  const [snapshot, deveval, contributions, featured, languages, lastPush] =
    await Promise.all([
      getGitHubSnapshot(githubUsername),
      getDevEvalStats(),
      getContributions(githubUsername),
      getFeaturedRepos(featuredRepos),
      getLanguages(),
      getLastPush(),
    ]);

  const favorite =
    featured.find((r) => r.nameWithOwner === FAVORITE_REPO) ?? null;

  // Only offer "View source" once the repo is actually public — the API only
  // lists public repos, so this flips on by itself the day it's flipped there.
  const sourceUrl = snapshot.publicRepoNames.includes(SITE_REPO_NAME)
    ? siteRepoUrl
    : null;

  return (
    <>
      <SiteNav stats={snapshot.stats} />

      <main className="mx-auto w-full max-w-profile bg-hero px-3 py-6 sm:px-4 sm:py-8">
        <ProfileHeader stats={snapshot.stats} sourceUrl={sourceUrl} />

        {/*
          Steam's main/sidebar split, restored. It was flattened to a single
          column and that was the wrong reading — what Bradley wanted contained
          in one column is the *page*, which the centred `max-w-profile` block
          above already does. The two columns live inside it.

          ~649 / 12 / ~325 at ≥lg; stacks below that. The gap is 12px, Steam's
          own `.profile_customization` margin, not the 16 it used to be.
        */}
        {/*
          `privacyScreen` in profile-data lays a cover over this whole block.
          The grid below is untouched and still renders — the cover is an
          overlay on top of it, nothing more. Flip the constant to false and
          both the height cap and the overlay go; there is no other change.

          The height cap is what keeps the cover short. Left to match the grid
          it stood ~1400px tall, a black slab longer than the rest of the page
          put together. Capping the wrapper and clipping the overflow means the
          grid still renders at full size underneath — no component below knows
          about this — while the block a visitor sees is one panel deep.
        */}
        <div
          className={`relative mt-3 ${
            privacyScreen ? "h-[220px] overflow-hidden" : ""
          }`}
        >
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="flex min-w-0 flex-col gap-3">
              <FavoriteProject repo={favorite} />
              <Experience featured={featured} />
              <ActivityFeed snapshot={snapshot} featured={featured} />
              {/* <Comments /> */}
            </div>

            <Sidebar
              snapshot={snapshot}
              deveval={deveval}
              contributions={contributions}
              languages={languages}
              lastPush={lastPush}
            />
          </div>

          {privacyScreen && <BoardedUp />}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
          <span>Every number on this page is fetched, not written.</span>
          <span>
            Layout inspired by Steam profiles. Not affiliated with Valve.
          </span>
        </footer>

        <AutoRefresh intervalSeconds={REVALIDATE_SECONDS} />
      </main>
    </>
  );
}
