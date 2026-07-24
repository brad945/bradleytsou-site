import type { FeedItem, FeedKind, GitHubSnapshot, RepoCard } from "@/lib/github";
import { REVALIDATE_SECONDS } from "@/lib/github";
import {
  githubUsername,
  monogram,
  PLACEHOLDER_GITHUB_USERNAME,
  profile,
} from "@/lib/profile-data";

interface ActivityFeedProps {
  snapshot: GitHubSnapshot;
}

/**
 * Killfeed colour by event kind. Every value comes from the token palette —
 * `accent` for "you did work", `live` for "something landed", `muted` for
 * ambient noise.
 */
const KIND_STYLE: Record<FeedKind, { chip: string; rail: string }> = {
  push: { chip: "border-accent/40 text-accent", rail: "bg-accent" },
  pr: { chip: "border-nebula/50 text-nebula", rail: "bg-nebula" },
  "pr-merged": { chip: "border-live/40 text-live", rail: "bg-live" },
  repo: { chip: "border-live/40 text-live", rail: "bg-live" },
  release: { chip: "border-accent/40 text-accent", rail: "bg-accent" },
  issue: { chip: "border-line text-muted", rail: "bg-line" },
  star: { chip: "border-line text-muted", rail: "bg-line" },
  fork: { chip: "border-line text-muted", rail: "bg-line" },
  other: { chip: "border-line text-muted", rail: "bg-line" },
};

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
 * A repo in the "recently played game" slot: capsule, name, headline numbers
 * on the right, and Steam's achievement-progress strip underneath — here it's
 * this repo's share of the commits pushed across all shown repos.
 */
function RepoRow({ repo, busiest, now }: { repo: RepoCard; busiest: number; now: number }) {
  const share = busiest > 0 ? Math.round((repo.commitsPast2Weeks / busiest) * 100) : 0;

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
            <div className="text-right text-[13px] leading-tight text-muted">
              <p>
                {repo.stars.toLocaleString()} {repo.stars === 1 ? "star" : "stars"} on record
              </p>
              <p>last pushed on {shortDate(repo.pushedAt)}</p>
            </div>
          </div>

          {repo.description && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/65">
              {repo.description}
            </p>
          )}

          <div className="mt-2.5 bg-panel2/50 px-2.5 py-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-[13px] text-ink/70">Commits past 2 weeks</span>
              <span className="text-[13px] text-muted">
                {repo.commitsPast2Weeks} · {repo.language ?? "—"} ·{" "}
                {relativeTime(repo.pushedAt, now)} ago
              </span>
            </div>
            <div className="mt-1.5 h-[6px] overflow-hidden bg-base/80">
              <div className="h-full bg-link/60" style={{ width: `${share}%` }} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function KillfeedRow({ item, now }: { item: FeedItem; now: number }) {
  const style = KIND_STYLE[item.kind] ?? KIND_STYLE.other;

  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 border-b border-line/40 px-3 py-2 transition-colors last:border-b-0 hover:bg-panel2/70 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span className={`h-5 w-[2px] shrink-0 ${style.rail}`} aria-hidden />

        <span className="shrink-0 font-mono text-[11px] text-ink/90">
          {profile.handle.replace("@", "")}
        </span>

        <span
          className={`shrink-0 border bg-base/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${style.chip}`}
        >
          {item.verb}
          {item.count && item.count > 1 ? ` ×${item.count}` : ""}
        </span>

        {item.headshot && (
          <span className="shrink-0 font-mono text-[10px] text-live" title="Landed">
            ✦
          </span>
        )}

        <span className="shrink-0 font-mono text-[11px] text-muted">{item.target}</span>

        {item.detail && (
          <span className="hidden min-w-0 flex-1 truncate text-[12px] text-muted/70 md:block">
            {item.detail}
          </span>
        )}

        <span className="ml-auto shrink-0 pl-2 font-mono text-[10px] text-muted/70">
          {relativeTime(item.at, now)}
        </span>
      </a>
    </li>
  );
}

function EmptyState({ error }: { error: string | null }) {
  const unconfigured = githubUsername === PLACEHOLDER_GITHUB_USERNAME;

  return (
    <div className="bg-base/40 px-5 py-10 text-center">
      <p className="text-[14px] text-muted">{error ?? "No public activity in range"}</p>
      {unconfigured && (
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted/70">
          Set <code className="font-mono text-ink/70">githubUsername</code> in{" "}
          <code className="font-mono text-ink/70">lib/profile-data.ts</code> and this feed fills
          itself in.
        </p>
      )}
    </div>
  );
}

export default function ActivityFeed({ snapshot }: ActivityFeedProps) {
  const { stats, feed, repos, error, fetchedAt } = snapshot;
  const now = Date.parse(fetchedAt);
  const isLive = snapshot.ok && feed.length > 0;
  const eventCount = stats?.eventsPast2Weeks ?? 0;
  /** Scale every repo's commit bar against the busiest repo on screen. */
  const busiest = Math.max(...repos.map((r) => r.commitsPast2Weeks), 0);

  return (
    <section aria-labelledby="activity-heading" className="panel">
      <div className="panel-bar">
        <h2 id="activity-heading" className="panel-bar-title">
          Recent Activity
        </h2>
        <span className="panel-bar-meta">
          {stats ? `${eventCount} events past 2 weeks` : "no data"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {repos.length > 0 && (
          <ul className="flex flex-col gap-3">
            {repos.map((repo) => (
              <RepoRow key={repo.id} repo={repo} busiest={busiest} now={now} />
            ))}
          </ul>
        )}

        {/* The killfeed. Every row is a real public GitHub event. */}
        <div className="bg-base/45">
          <div className="flex items-center justify-between border-b border-line/50 px-3 py-2">
            <span className="label">Killfeed</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-live animate-pulse-live" : "bg-muted/50"}`}
                aria-hidden
              />
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.14em] ${isLive ? "text-live" : "text-muted"}`}
              >
                {isLive ? "Live" : "Idle"}
              </span>
            </span>
          </div>

          {feed.length === 0 ? (
            <EmptyState error={error} />
          ) : (
            <ul>
              {feed.map((item) => (
                <KillfeedRow key={item.id} item={item} now={now} />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1 text-[14px] text-muted">
          {stats ? (
            <>
              <span>View</span>
              <a href={stats.profileUrl} target="_blank" rel="noreferrer" className="steam-link">
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
            </>
          ) : (
            <span className="text-muted/60">
              refreshes every {REVALIDATE_SECONDS / 60} minutes
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
