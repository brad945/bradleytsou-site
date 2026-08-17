import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";
import BoardedUp from "@/components/BoardedUp";
import Experience from "@/components/Experience";
import { FavoriteProject } from "@/components/ItemShowcase";
import ProfileHeader from "@/components/ProfileHeader";
import SiteNav from "@/components/SiteNav";
import Sidebar from "@/components/Sidebar";
import Comments from "@/components/Comments";

// Parked, and swapped for Comments. Everything works — the route, the store,
// the flying emoji — it's just not what's wanted on the page right now.
// Uncomment this and the tag below to bring it back; the Upstash env vars are
// still what decides whether it renders at all.
// import Reactions from "@/components/Reactions";

import Exy from "@/components/Exy";

import { getDevEvalStats } from "@/lib/deveval";
import {
  getContributions,
  getGitHubSnapshot,
  getFeaturedRepos,
  getLanguages,
  getLastPush,
  getDiscussionComments,
  REVALIDATE_SECONDS,
} from "@/lib/github";
import {
  githubUsername,
  FAVORITE_REPO,
  featuredRepos,
  privacyScreen,
  giscus,
  siteRepoSlug,
} from "@/lib/profile-data";

/** ISR window for the whole page — matches the feed's fetch revalidate. */
export const revalidate = 300;

export default async function Home() {
  const [owner, repo] = siteRepoSlug.split("/");
  const [
    snapshot,
    deveval,
    contributions,
    featured,
    languages,
    lastPush,
    commentCount,
  ] = await Promise.all([
    getGitHubSnapshot(githubUsername),
    getDevEvalStats(),
    getContributions(githubUsername),
    getFeaturedRepos(featuredRepos),
    getLanguages(),
    getLastPush(),
    // The comments panel is a real GitHub Discussion, so the sidebar's
    // Comments row can finally be a number instead of an em-dash.
    getDiscussionComments(owner, repo, giscus.discussion),
  ]);

  const favorite =
    featured.find((r) => r.nameWithOwner === FAVORITE_REPO) ?? null;

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
        <ProfileHeader stats={snapshot.stats} />

        {/*
          Steam's main/sidebar split, restored. It was flattened to a single
          column and that was the wrong reading — what Bradley wanted contained
          in one column is the *page*, which the centred `max-w-profile` block
          above already does. The two columns live inside it.

          ~649 / 12 / ~325 at ≥lg; stacks below that. The gap is 12px, Steam's
          own `.profile_customization` margin, not the 16 it used to be.
        */}
        {/*
          The cover renders *instead of* the grid, not over it — see the note
          on `privacyScreen`. The grid below is untouched; flipping the flag
          brings it back exactly as it is.
        */}
        {privacyScreen ? (
          <BoardedUp />
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="flex min-w-0 flex-col gap-3">
              {/*
              Order: Activity, Experience, Favorite Project. Activity leads
              because what he's working on now reads before where he's been,
              and Favorite Project sits last as the closing note rather than
              the opening one.
            */}
              <ActivityFeed snapshot={snapshot} featured={featured} />
              <Experience featured={featured} />
              <FavoriteProject repo={favorite} />
              {/* The panel a visitor contributes to, last in the column so it
                  reads as the end of the page rather than an interruption in
                  it. Reactions is parked above; this is the swap. */}
              {/* <Reactions /> */}
              <Comments />
            </div>

            <Sidebar
              snapshot={snapshot}
              deveval={deveval}
              contributions={contributions}
              languages={languages}
              lastPush={lastPush}
              commentCount={commentCount}
            />
          </div>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
          <span>
            Layout inspired by Steam profiles. Not affiliated with Valve.
          </span>
        </footer>

        <AutoRefresh intervalSeconds={REVALIDATE_SECONDS} />

        {/* Sits outside the column on purpose — he walks the whole viewport,
            not just the centred block. */}
        <Exy />
      </main>
    </>
  );
}
