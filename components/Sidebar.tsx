import { DEVEVAL_ROWS, type DevEvalStats } from "@/lib/deveval";
import type { Contributions, LanguageCount } from "@/lib/github";
import type { GitHubSnapshot } from "@/lib/github";
import { linkedinFollowers, profile, socials } from "@/lib/profile-data";

interface SidebarProps {
  snapshot: GitHubSnapshot;
  /** Null when DEVEVAL_STATS_URL isn't set or the endpoint is unreachable. */
  deveval: DevEvalStats | null;
  /** Null without a token — GraphQL is auth-only. */
  contributions: Contributions | null;
  /** All-repo breakdown. Empty without a token — falls back to public-only. */
  languages: LanguageCount[];
  /** ISO timestamp of the most recent push, or null without a token. */
  lastPush: string | null;
}

/** A grey label with a large light number, Steam's sidebar stat row. */
function Stat({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      {value !== null && value !== undefined && (
        <span className="stat-value">{value}</span>
      )}
    </div>
  );
}

/**
 * Steam's three presence states, mapped onto push recency. The thresholds are
 * a judgement call, but every one of them is derived — nothing here asserts
 * presence the data can't support.
 */
/** "12 minutes", "6 hours", "3 days" — no "ago", the caller adds it. */
function sinceLabel(iso: string, now: number): string | null {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return null;
  const mins = Math.max(0, Math.round((now - then) / 6e4));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

function pushStatus(lastPush: string | null, now: number) {
  const then = lastPush ? Date.parse(lastPush) : NaN;
  if (!Number.isFinite(then)) {
    return { label: "Currently Offline", tone: "text-muted" };
  }
  const hours = (now - then) / 36e5;
  if (hours < 6) return { label: "Currently Online", tone: "text-live" };
  if (hours < 72) return { label: "Recently Active", tone: "text-accent" };
  return { label: "Currently Offline", tone: "text-muted" };
}

export default function Sidebar({
  snapshot,
  deveval,
  contributions,
  languages,
  lastPush,
}: SidebarProps) {
  const { stats } = snapshot;
  const now = Date.parse(snapshot.fetchedAt);
  const status = pushStatus(lastPush, now);
  const since = lastPush ? sinceLabel(lastPush, now) : null;
  // The token-backed breakdown sees private repos and every language per repo;
  // the snapshot's is public-only primaryLanguage and reads far too narrow.
  const langs = languages.length > 0 ? languages : snapshot.languages;

  return (
    <div className="flex flex-col gap-4">
      <section className="panel px-5 py-5">
        {/*
          Derived from the last push, not hardcoded. This used to read
          "Currently Online" in green permanently, regardless of anything.
        */}
        <h2 className={`text-[24px] font-light leading-tight ${status.tone}`}>
          {status.label}
        </h2>
        {/* Says exactly what it measures — a push, not presence. */}
        {since && <p className="t-meta mt-1">Last commit {since}</p>}
        {/*
          Zero-value rows are hidden rather than listed. "Following 0 / Gists 0"
          fills space without telling anyone anything, and because the check is
          live each row returns on its own once the number moves. Followers,
          Reviews and Issues are cut outright — GitHub follower count says
          nothing here, and the other two were 0 with no prospect of moving.
        */}
        <div className="mt-5">
          <Stat label="Public Repos" value={stats?.publicRepos ?? "—"} />
          {!!stats?.following && (
            <Stat label="Following" value={stats.following} />
          )}
          {!!stats?.publicGists && (
            <Stat label="Gists" value={stats.publicGists} />
          )}
          <Stat label="Member Since" value={stats?.memberSince ?? "—"} />
        </div>

        {/*
          Contributions used to be its own panel. It's the same subject as the
          status above it — how active he is — so it reads better as a second
          group in one box than as a second box.
        */}
        {contributions && (
          <div className="mt-7">
            <div className="stat-row">
              <span className="stat-label">Contributions</span>
              <span className="stat-value">
                {contributions.total.toLocaleString()}
              </span>
            </div>
            <p className="t-meta -mt-1">Past year</p>

            <div className="mt-3">
              <Stat label="Pull Requests" value={contributions.pullRequests} />
              <Stat label="Merged" value={contributions.pullRequestsMerged} />
              <Stat
                label="Repos Created"
                value={contributions.repositoriesCreated}
              />
            </div>
          </div>
        )}
      </section>

      {/*
        The one block on this page fed by Bradley's own product rather than
        someone else's API. Absent entirely when the endpoint isn't configured
        or is down — never a placeholder number.
      */}
      {deveval && (
        <section className="panel px-5 py-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-normal leading-tight text-bright">
              DevEval
            </h2>
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live"
                aria-hidden
              />
              <span className="t-meta text-live">Live</span>
            </span>
          </div>
          <p className="t-meta mt-1">Straight off the DevEval API.</p>

          <div className="mt-4">
            {DEVEVAL_ROWS.map(({ key, label }) =>
              deveval[key] === undefined ? null : (
                <div key={key} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value">
                    {deveval[key]!.toLocaleString()}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {langs.length > 0 && (
        <section className="panel px-5 py-5">
          <div className="stat-row">
            <span className="stat-label">Languages</span>
            <span className="stat-value">{langs.length}</span>
          </div>
          {/*
            A plain list, not bars. Bars here were scaled against the most-used
            language, which is an arbitrary denominator that conveys nothing —
            the repo count already says everything the bar was implying.
          */}
          <ul className="mt-2 flex flex-col">
            {langs.map((language) => (
              <li
                key={language.name}
                className="flex items-baseline justify-between gap-2 py-1"
              >
                <span className="t-body">{language.name}</span>
                <span className="t-meta">
                  {language.repos} {language.repos === 1 ? "repo" : "repos"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel px-5 py-5">
        <div className="stat-row">
          <span className="stat-label">Links</span>
          <span className="stat-value">{socials.length}</span>
        </div>
        {/*
          Reach shown per link where there's a number. GitHub's is live off the
          API; LinkedIn's is hand-entered because LinkedIn has no public API,
          so that one silently goes stale — see `linkedinFollowers`.
        */}
        <ul className="mt-2 flex flex-col">
          {socials.map((link) => {
            const reach =
              link.label === "GitHub"
                ? stats?.followers
                : link.label === "LinkedIn"
                  ? linkedinFollowers
                  : undefined;

            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={
                    link.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel="noreferrer"
                  className="group flex items-baseline justify-between gap-2 py-1.5"
                >
                  <span className="steam-link text-[14px]">{link.label}</span>
                  {reach !== undefined && reach > 0 && (
                    <span className="t-meta">
                      {reach.toLocaleString()}{" "}
                      {reach === 1 ? "follower" : "followers"}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
