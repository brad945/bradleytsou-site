import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";
import ItemShowcase, { FavoriteProject } from "@/components/ItemShowcase";
import ProfileHeader from "@/components/ProfileHeader";
import Sidebar from "@/components/Sidebar";
// Parked until GitHub Discussions is enabled and giscus IDs are real.
// See components/Comments.tsx.
// import Comments from "@/components/Comments";

import { getGitHubSnapshot, REVALIDATE_SECONDS } from "@/lib/github";
import { githubUsername } from "@/lib/profile-data";

/** ISR window for the whole page — matches the feed's fetch revalidate. */
export const revalidate = 300;

export default async function Home() {
  const snapshot = await getGitHubSnapshot(githubUsername);

  return (
    <main className="mx-auto w-full max-w-profile px-3 py-6 sm:px-4 sm:py-8">
      <ProfileHeader stats={snapshot.stats} />

      {/* 616 / 16 / 308 at ≥lg — Steam's column split. Stacks below that. */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <FavoriteProject />
          <ItemShowcase />
          <ActivityFeed snapshot={snapshot} />
          {/* <Comments /> */}
        </div>

        <Sidebar snapshot={snapshot} />
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted/70">
        <span>Every number on this page is fetched, not written.</span>
        <span>Layout inspired by Steam profiles. Not affiliated with Valve.</span>
      </footer>

      <AutoRefresh intervalSeconds={REVALIDATE_SECONDS} />
    </main>
  );
}
