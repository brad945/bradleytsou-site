import type { FeaturedRepo, GitHubSnapshot, RepoCard } from "@/lib/github";
import { monogram } from "@/lib/profile-data";
import { GitHubIcon } from "@/components/SocialIcons";

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
 * One activity source inside the panel.
 *
 * Recent Activity used to *be* GitHub — the panel's contents were repo rows
 * and nothing said so. It's becoming a feed of several sources, so each one is
 * now labelled and boxed, and GitHub is one of them rather than the whole
 * thing.
 *
 * A `live` dot marked fetched sources apart from hand-kept ones and was
 * removed at Bradley's request. The distinction still matters when the other
 * sources land — it's stated in `PlannedSources` instead, in words.
 */
function SourceBlock({
  name,
  icon,
  children,
}: {
  name: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="t-label text-copy">{name}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * The sources that aren't built yet, named rather than implied.
 *
 * A draft on purpose — Bradley wants the shape of a multi-source feed before
 * any of it is wired. It says which are API-backed and which he'd keep by
 * hand, because that's the part that decides whether a source is worth
 * building: books and games have no usable public API, so those rows would be
 * written, not fetched, and this page's whole premise is knowing which is
 * which.
 */
function PlannedSources() {
  return (
    <div className="border border-dashed border-line/70 px-4 py-4">
      <p className="t-label text-muted">More sources</p>
      <p className="t-meta mt-1.5 leading-relaxed">
        Spotify, YouTube, videogame, books, etc. Not built — Spotify and YouTube
        have APIs to pull from; books and games would be hand-kept.
      </p>
    </div>
  );
}

/**
 * How many repos the panel shows.
 *
 * Sliced here rather than trimmed out of `featuredRepos`, because that list
 * also drives the sidebar's repo block and the `ghRepo` lookups behind the
 * Experience rows — dropping an entry there would pull its data off the page
 * in three places instead of shortening one panel.
 *
 * So a fourth repo added to `featuredRepos` still fetches and still appears
 * elsewhere; it just doesn't show up here.
 */
const MAX_ROWS = 2;

/**
 * A featured repo in Steam's "recently played" slot.
 *
 * **Every commit count is gone**, at Bradley's request: the per-row total, the
 * "commits past 2 weeks" strip, and the panel-bar sum that was the analogue of
 * Steam's hours-past-2-weeks. A row is now the repo, its language, when it was
 * last pushed, and its description.
 *
 * `myCommits` and `myCommitsPast2Weeks` are still fetched and still on
 * `FeaturedRepo` — nothing was removed from the data layer, so putting any of
 * it back is a render change only.
 *
 * Private repos aren't linked — a visitor gets a 404.
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
    <li className="bg-panel2/70">
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
              {/* Commit count removed at Bradley's request; the language
                  was sharing this line and stays. */}
              {repo.language && <p>{repo.language}</p>}
              <p>
                last pushed on {shortDate(repo.pushedAt)} ·{" "}
                {relativeTime(repo.pushedAt, now)} ago
              </p>
            </div>
          </div>

          {repo.description && (
            <p className="t-meta mt-1.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/** Fallback row, used only when there's no token to fetch the featured repos. */
function PublicRepoRow({ repo, now }: { repo: RepoCard; now: number }) {
  return (
    <li className="bg-panel2/70">
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
                {repo.language ? ` · ${repo.language}` : ""}
              </p>
              <p>
                last pushed on {shortDate(repo.pushedAt)} ·{" "}
                {relativeTime(repo.pushedAt, now)} ago
              </p>
            </div>
          </div>

          {repo.description && (
            <p className="t-meta mt-1.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
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

  const hasRows = useFeatured || repos.length > 0;

  return (
    <section aria-labelledby="activity-heading" className="panel">
      <div className="panel-bar">
        <h2 id="activity-heading" className="panel-bar-title">
          Recent Activity
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <SourceBlock
          name="GitHub"
          icon={<GitHubIcon className="h-4 w-4 text-muted" />}
        >
          {hasRows ? (
            <ul className="flex flex-col gap-3">
              {useFeatured
                ? featured
                    .slice(0, MAX_ROWS)
                    .map((repo) => (
                      <FeaturedRepoRow
                        key={repo.nameWithOwner}
                        repo={repo}
                        now={now}
                      />
                    ))
                : repos
                    .slice(0, MAX_ROWS)
                    .map((repo) => (
                      <PublicRepoRow key={repo.id} repo={repo} now={now} />
                    ))}
            </ul>
          ) : (
            <div className="bg-panel2/70 px-5 py-10 text-center">
              <p className="t-label">
                {snapshot.error ?? "No repository activity to show"}
              </p>
            </div>
          )}
        </SourceBlock>

        <PlannedSources />

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
