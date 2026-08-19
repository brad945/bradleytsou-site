import type { FeaturedRepo, GitHubSnapshot, RepoCard } from "@/lib/github";
import { repoDisplayNames } from "@/lib/profile-data";
import Bookshelf from "@/components/Bookshelf";
import { BookIcon, GitHubIcon, SpotifyIcon } from "@/components/SocialIcons";
import type { Track } from "@/lib/spotify";

interface ActivityFeedProps {
  snapshot: GitHubSnapshot;
  /** Hand-picked repos. Empty without a token — falls back to the public list. */
  featured: FeaturedRepo[];
  /** Recently played. Empty when Spotify isn't configured; the block hides. */
  tracks: Track[];
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
  note,
  children,
}: {
  name: string;
  icon?: React.ReactNode;
  /**
   * A qualifier beside the source name.
   *
   * Exists for exactly one case: **Books is the only source here that isn't
   * fetched.** GitHub and Spotify are live, and an unlabelled third block
   * sitting between them would inherit their credibility without earning it.
   * Goodreads closed their API in 2020 and nothing replaced it, so that list
   * can only ever be written — and this is where it says so.
   */
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="flex items-center gap-2">
          {icon}
          <span className="t-label text-copy">{name}</span>
        </span>
        {note && <span className="t-meta text-[12px]">{note}</span>}
      </div>
      {children}
    </div>
  );
}

/**
 * A single Spotify row: track on the left, artist and when on the right.
 *
 * Same shape as the repo rows above it deliberately — two sources reading the
 * same way is what makes this a feed rather than two widgets in a box.
 */
function TrackRow({ track, now }: { track: Track; now: number }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-line/40 py-2 first:border-t-0">
      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        className="steam-link text-[15px] leading-tight"
      >
        {track.title}
      </a>
      <span className="t-meta leading-tight">
        {[track.artist, `${relativeTime(track.playedAt, now)} ago`]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </li>
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
        YouTube and videogames next.
      </p>
    </div>
  );
}

/**
 * How many repos the GitHub block lists.
 *
 * Sliced here rather than trimmed out of `featuredRepos`, because that list
 * also drives the sidebar's repo block and the `ghRepo` lookups behind the
 * Experience rows — dropping an entry there would pull its data off the page
 * in three places instead of shortening one panel.
 *
 * So a fourth repo added to `featuredRepos` still fetches and still appears
 * elsewhere; it just doesn't show up here.
 */
const MAX_ROWS = 3;

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
  const label = repoDisplayNames[repo.nameWithOwner] ?? repo.name;

  /*
   * The product's own site wins over the repo.
   *
   * DevEval's repo is private, so this row was plain text with a Private tag —
   * even though deveval.com exists and is what a reader actually wants. GitHub
   * already holds that URL in the repo's Website field, so it's fetched rather
   * than kept in a second list here.
   *
   * A public repo with no site still links to the repo, as before.
   */
  const href = repo.homepage ?? (repo.isPrivate ? undefined : repo.url);

  const title = href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="steam-link text-[15px] leading-tight"
    >
      {label}
    </a>
  ) : (
    <span className="text-[15px] leading-tight text-copy">{label}</span>
  );

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-line/40 py-2 first:border-t-0">
      <span className="flex flex-wrap items-baseline gap-2">
        {title}
        {/*
          Marks a row with nothing to open, which is not the same as a private
          repo — DevEval's repo is private but its site isn't, so that row is a
          link and carries no tag.
        */}
        {!href && (
          <span className="border border-line px-1.5 py-px text-[10px] uppercase tracking-wider text-muted">
            Private
          </span>
        )}
      </span>
      <span className="t-meta leading-tight">
        {[repo.language, `${relativeTime(repo.pushedAt, now)} ago`]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </li>
  );
}

function PublicRepoRow({ repo, now }: { repo: RepoCard; now: number }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-line/40 py-2 first:border-t-0">
      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="steam-link text-[15px] leading-tight"
      >
        {repo.name}
      </a>
      <span className="t-meta leading-tight">
        {[repo.language, `${relativeTime(repo.pushedAt, now)} ago`]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </li>
  );
}

export default function ActivityFeed({
  snapshot,
  featured,
  tracks,
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

      <div className="flex flex-col gap-5 p-5 pt-3">
        <SourceBlock
          name="GitHub"
          icon={<GitHubIcon className="h-4 w-4 text-muted" />}
        >
          {hasRows ? (
            <ul className="flex flex-col">
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

        {/*
          Hidden entirely when Spotify isn't configured or returned nothing —
          same contract as the DevEval block. An empty "Spotify" heading would
          claim a source the page doesn't actually have.
        */}
        {tracks.length > 0 && (
          <SourceBlock
            name="Spotify"
            icon={<SpotifyIcon className="h-4 w-4 text-muted" />}
          >
            <ul className="flex flex-col">
              {tracks.map((track) => (
                <TrackRow key={track.url} track={track} now={now} />
              ))}
            </ul>
          </SourceBlock>
        )}

        <SourceBlock
          name="Books"
          icon={<BookIcon className="h-4 w-4 text-muted" />}
          note="kept by hand"
        >
          <Bookshelf />
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
