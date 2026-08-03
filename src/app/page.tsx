import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";
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

      {/*
        Top padding is deliberately smaller than the bottom: `pt-3` against
        `pb-6`/`pb-8`. The nav is its own dark bar, so the column's top padding
        was stacking on the visual break the bar already makes and pushing the
        avatar down away from it. The bottom keeps the larger value — there's
        nothing under the column to break against.
      */}
      <main className="mx-auto w-full max-w-profile bg-hero px-3 pb-6 pt-3 sm:px-4 sm:pb-8 sm:pt-4">
        <ProfileHeader stats={snapshot.stats} sourceUrl={sourceUrl} />

        {/*
          Steam's main/sidebar split, restored. It was flattened to a single
          column and that was the wrong reading — what Bradley wanted contained
          in one column is the *page*, which the centred `max-w-profile` block
          above already does. The two columns live inside it.

          ~649 / 12 / ~325 at ≥lg; stacks below that. The gap is 12px, Steam's
          own `.profile_customization` margin, not the 16 it used to be.
        */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
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

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
          <span>
            Layout inspired by Steam profiles. Not affiliated with Valve.
          </span>
        </footer>

        <AutoRefresh intervalSeconds={REVALIDATE_SECONDS} />
      </main>
    </>
  );
}
