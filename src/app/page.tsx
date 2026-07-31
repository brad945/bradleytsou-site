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

      <main className="mx-auto w-full max-w-profile bg-hero px-3 py-6 sm:px-4 sm:py-8">
        <ProfileHeader stats={snapshot.stats} sourceUrl={sourceUrl} />

        {/*
          One column, at Bradley's request. This was Steam's 616/16/308 split
          at ≥lg, which stacked below that breakpoint — so this is the stacked
          order the narrow layout already used, now applied at every width.
          The sidebar panels keep their own internal stacking.
        */}
        <div className="mt-4 flex min-w-0 flex-col gap-4">
          <FavoriteProject repo={favorite} />
          <Experience featured={featured} />
          <ActivityFeed snapshot={snapshot} featured={featured} />
          {/* <Comments /> */}

          <Sidebar
            snapshot={snapshot}
            deveval={deveval}
            contributions={contributions}
            languages={languages}
            lastPush={lastPush}
          />
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
