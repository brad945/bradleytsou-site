import ActivityFeed from "@/components/ActivityFeed";
import AutoRefresh from "@/components/AutoRefresh";
import ItemShowcase from "@/components/ItemShowcase";
import ProfileHeader from "@/components/ProfileHeader";
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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-3">
        <ProfileHeader stats={snapshot.stats} />
        <ItemShowcase />
        <ActivityFeed snapshot={snapshot} />
        {/* <Comments /> */}
      </div>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted/60">
        <span>Every number on this page is fetched, not written.</span>
        <span>Structure inspired by Steam profiles. Not affiliated with Valve.</span>
      </footer>

      <AutoRefresh intervalSeconds={REVALIDATE_SECONDS} />
    </main>
  );
}
