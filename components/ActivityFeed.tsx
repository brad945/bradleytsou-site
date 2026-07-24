import type { FeedItem, FeedKind, GitHubSnapshot } from "@/lib/github";
import { REVALIDATE_SECONDS } from "@/lib/github";
import { githubUsername, PLACEHOLDER_GITHUB_USERNAME, profile } from "@/lib/profile-data";

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

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex-1 px-4 py-3 first:pl-5 last:pr-5">
      <p className="label">{label}</p>
      <p className="mt-1.5 font-mono text-2xl leading-none text-ink">{value}</p>
      {note && <p className="mt-1.5 font-mono text-[10px] text-muted">{note}</p>}
    </div>
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
        className="group flex items-center gap-3 border-b border-line/60 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-panel2 focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <span className={`h-6 w-[2px] shrink-0 rounded-full ${style.rail}`} aria-hidden />

        {/* Attacker */}
        <span className="shrink-0 font-mono text-xs text-ink">{profile.handle.replace("@", "")}</span>

        {/* Weapon chip */}
        <span
          className={`shrink-0 rounded-sm border bg-base px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${style.chip}`}
        >
          {item.verb}
          {item.count && item.count > 1 ? ` ×${item.count}` : ""}
        </span>

        {item.headshot && (
          <span className="shrink-0 font-mono text-[10px] text-live" title="Landed">
            ✦
          </span>
        )}

        {/* Victim */}
        <span className="shrink-0 font-mono text-xs text-muted">{item.target}</span>

        {/* Detail — first to be sacrificed on narrow screens */}
        {item.detail && (
          <span className="hidden min-w-0 flex-1 truncate text-xs text-muted/70 md:block">
            {item.detail}
          </span>
        )}

        {/* Always last, always flush right, with or without a detail column. */}
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
    <div className="px-5 py-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {error ?? "No public activity in range"}
      </p>
      {unconfigured && (
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted/70">
          Set <code className="font-mono text-ink/70">githubUsername</code> in{" "}
          <code className="font-mono text-ink/70">lib/profile-data.ts</code> and this feed fills
          itself in.
        </p>
      )}
    </div>
  );
}

export default function ActivityFeed({ snapshot }: ActivityFeedProps) {
  const { stats, feed, error, fetchedAt } = snapshot;
  const now = Date.parse(fetchedAt);
  const isLive = snapshot.ok && feed.length > 0;

  return (
    <section aria-labelledby="activity-heading" className="panel bg-panel-sheen">
      <div className="flex flex-wrap items-baseline justify-between gap-3 px-5 pt-5">
        <div>
          <h2 id="activity-heading" className="font-display text-lg font-medium tracking-tight">
            Recent Activity
          </h2>
          <p className="mt-1 text-xs text-muted">
            Straight off the GitHub API. Refreshes every {REVALIDATE_SECONDS / 60} minutes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-live animate-pulse-live" : "bg-muted/50"}`}
            aria-hidden
          />
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.14em] ${isLive ? "text-live" : "text-muted"}`}
          >
            {isLive ? "Live" : "Idle"}
          </span>
        </div>
      </div>

      {/* Metrics strip — the "hours past 2 weeks" slot, with real numbers. */}
      <div className="mx-5 mt-4 flex flex-wrap divide-x divide-line rounded-panel border border-line bg-base">
        <Metric
          label="Events / 2 weeks"
          value={stats ? String(stats.eventsPast2Weeks) : "—"}
          note="public events"
        />
        <Metric
          label="Public repos"
          value={stats ? String(stats.publicRepos) : "—"}
        />
        <Metric label="Followers" value={stats ? String(stats.followers) : "—"} />
      </div>

      <div className="mt-4">
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

      {stats && (
        <div className="border-t border-line px-5 py-3">
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
          >
            Full history on GitHub ↗
          </a>
        </div>
      )}
    </section>
  );
}
