import type { FeaturedRepo, GitHubSnapshot, RepoCard } from "@/lib/github";
import { monogram } from "@/lib/profile-data";

interface ActivityFeedProps {
  snapshot: GitHubSnapshot;
  /** Hand-picked repos. Empty without a token — falls back to the public list. */
  featured: FeaturedRepo[];
}

function relativeTime(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "—";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

/** "Jul 24" — matches Steam's "last played on" format. */
function shortDate(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "unknown";
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A featured repo in Steam's "recently played" slot.
 *
 * Commits in the last two weeks is the direct analogue of the hours-past-2-weeks
 * figure Steam puts here. It's shown as a plain number: an earlier version drew
 * a bar scaled against whichever featured repo was busiest, which is an
 * arbitrary comparison that conveys nothing — decoration dressed as data.
 *
 * The headline commit count is author-scoped, so it's this person's work
 * rather than the repo's. Private repos aren't linked — a visitor gets a 404.
 */
function FeaturedRepoRow({ repo, now }: { repo: FeaturedRepo; now: number }) {
  const title = repo.isPrivate ? (
    <span className="text-[17px] font-light leading-tight text-copy">
      {repo.name}
    </span>
  ) : (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="steam-link text-[17px] font-light leading-tight"
    >
      {repo.name}
    </a>
  );

  return (
    <li className="bg-base/45">
      <div className="flex flex-col gap-3 p-3 sm:flex-row">
        <div className="flex h-[87px] w-full shrink-0 items-center justify-center border border-line/70 bg-panel2/70 sm:w-[184px]">
          <span
            className={`text-[26px] font-light leading-none ${
              repo.isPrivate ? "text-muted" : "text-link/80"
            }`}
          >
            {monogram(repo.name)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <span className="flex flex-wrap items-center gap-2">
              {title}
              {repo.isPrivate && (
                <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted">
                  Private
                </span>
              )}
            </span>
            <div className="t-meta text-right leading-tight">
              <p>
                {repo.myCommits.toLocaleString()}{" "}
                {repo.myCommits === 1 ? "commit" : "commits"}
              </p>
              <p>last pushed on {shortDate(repo.pushedAt)}</p>
            </div>
          </div>

          {repo.description && (
            <p className="t-meta mt-1.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}

          <div className="mt-2.5 bg-panel2/50 px-2.5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="t-label text-copy">Commits past 2 weeks</span>
              <span className="flex items-baseline gap-2">
                <span className="text-[17px] font-light leading-none text-ink">
                  {repo.myCommitsPast2Weeks}
                </span>
                <span className="t-meta">
                  {repo.language ?? "—"} · {relativeTime(repo.pushedAt, now)}{" "}
                  ago
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Fallback row, used only when there's no token to fetch the featured repos. */
function PublicRepoRow({ repo, now }: { repo: RepoCard; now: number }) {
  return (
    <li className="bg-base/45">
      <div className="flex flex-col gap-3 p-3 sm:flex-row">
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="flex h-[87px] w-full shrink-0 items-center justify-center border border-line/70 bg-panel2/70 transition-colors hover:border-link/50 sm:w-[184px]"
        >
          <span className="text-[26px] font-light leading-none text-link/80">
            {monogram(repo.name)}
          </span>
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="steam-link text-[17px] font-light leading-tight"
            >
              {repo.name}
            </a>
            <div className="t-meta text-right leading-tight">
              <p>
                {repo.stars.toLocaleString()}{" "}
                {repo.stars === 1 ? "star" : "stars"} on record
              </p>
              <p>last pushed on {shortDate(repo.pushedAt)}</p>
            </div>
          </div>

          {repo.description && (
            <p className="t-meta mt-1.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}

          <div className="mt-2.5 bg-panel2/50 px-2.5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="t-label text-copy">Commits past 2 weeks</span>
              <span className="flex items-baseline gap-2">
                <span className="text-[17px] font-light leading-none text-ink">
                  {repo.commitsPast2Weeks}
                </span>
                <span className="t-meta">
                  {repo.language ?? "—"} · {relativeTime(repo.pushedAt, now)}{" "}
                  ago
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ActivityFeed({
  snapshot,
  featured,
}: ActivityFeedProps) {
  const { stats, repos, fetchedAt } = snapshot;
  const now = Date.parse(fetchedAt);
  const useFeatured = featured.length > 0;

  /*
   * The header count is summed from the rows on screen. The snapshot's own
   * eventsPast2Weeks only counts *public* events, which for a mostly-private
   * account reads as near-zero and badly understates the work.
   */
  const commitsPast2Weeks = useFeatured
    ? featured.reduce((sum, repo) => sum + repo.myCommitsPast2Weeks, 0)
    : repos.reduce((sum, repo) => sum + repo.commitsPast2Weeks, 0);

  const hasRows = useFeatured || repos.length > 0;

  return (
    <section aria-labelledby="activity-heading" className="panel">
      <div className="panel-bar">
        <h2 id="activity-heading" className="panel-bar-title">
          Recent Activity
        </h2>
        <span className="panel-bar-meta">
          {commitsPast2Weeks.toLocaleString()}{" "}
          {commitsPast2Weeks === 1 ? "commit" : "commits"} past 2 weeks
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {hasRows ? (
          <ul className="flex flex-col gap-3">
            {useFeatured
              ? featured.map((repo) => (
                  <FeaturedRepoRow
                    key={repo.nameWithOwner}
                    repo={repo}
                    now={now}
                  />
                ))
              : repos.map((repo) => (
                  <PublicRepoRow key={repo.id} repo={repo} now={now} />
                ))}
          </ul>
        ) : (
          <div className="bg-base/45 px-5 py-10 text-center">
            <p className="t-label">
              {snapshot.error ?? "No repository activity to show"}
            </p>
          </div>
        )}

        {stats && (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1 text-[14px] text-muted">
            <span>View</span>
            <a
              href={stats.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="steam-link"
            >
              All Activity
            </a>
            <span className="text-muted/50">|</span>
            <a
              href={`${stats.profileUrl}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              className="steam-link"
            >
              Repositories
            </a>
            <span className="text-muted/50">|</span>
            <a
              href={`${stats.profileUrl}?tab=stars`}
              target="_blank"
              rel="noreferrer"
              className="steam-link"
            >
              Stars
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
