/**
 * Public GitHub REST API, called straight from server components.
 *
 * No backend, no database, no token required. `GITHUB_TOKEN` is honoured if
 * present (raises the rate limit from 60/hr/IP to 5000/hr) but the site is
 * designed to work without it.
 *
 * Every failure mode — bad username, rate limit, network — degrades to an
 * empty snapshot rather than throwing, so a placeholder username can't break
 * the build or 500 the page.
 */

import { PLACEHOLDER_GITHUB_USERNAME } from "@/lib/profile-data";

const API = "https://api.github.com";

/** Seconds. Matches the "refreshes every 5 minutes" behaviour of the feed. */
export const REVALIDATE_SECONDS = 300;

export type FeedKind =
  | "push"
  | "pr"
  | "pr-merged"
  | "repo"
  | "release"
  | "issue"
  | "star"
  | "fork"
  | "other";

export interface FeedItem {
  id: string;
  kind: FeedKind;
  /** Killfeed verb, e.g. "PUSH", "MERGE". Rendered in the weapon-chip slot. */
  verb: string;
  /** The thing acted on — repo name, always the "victim" side of the feed. */
  target: string;
  /** Optional right-hand detail: commit message, PR title, tag name. */
  detail?: string;
  /** Numeric multiplier, e.g. 3 commits in one push. */
  count?: number;
  /** Marks a standout event (merged PR, release) — renders a highlight tick. */
  headshot: boolean;
  url: string;
  /** ISO timestamp. */
  at: string;
}

export interface GitHubStats {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  /** Public events in the last 14 days — the "hours past 2 weeks" analogue. */
  eventsPast2Weeks: number;
}

export interface GitHubSnapshot {
  ok: boolean;
  /** Human-readable reason the snapshot is empty, or null. */
  error: string | null;
  stats: GitHubStats | null;
  feed: FeedItem[];
  /** When this snapshot was built, ISO. */
  fetchedAt: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string };
  payload?: {
    size?: number;
    ref?: string;
    ref_type?: string;
    action?: string;
    commits?: { message: string }[];
    pull_request?: { title: string; merged?: boolean; html_url?: string; number?: number };
    issue?: { title: string; html_url?: string; number?: number };
    release?: { tag_name?: string; html_url?: string };
  };
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "bradleytsou-site",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function getJson<T>(path: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: headers(),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      if (res.status === 404) return { data: null, error: "GitHub user not found" };
      if (res.status === 403 || res.status === 429) {
        return { data: null, error: "GitHub rate limit reached" };
      }
      return { data: null, error: `GitHub responded ${res.status}` };
    }

    return { data: (await res.json()) as T, error: null };
  } catch {
    return { data: null, error: "Could not reach GitHub" };
  }
}

/** Strip the `owner/` prefix — the killfeed only has room for the repo name. */
function shortRepo(full: string | undefined): string {
  if (!full) return "unknown";
  const slash = full.indexOf("/");
  return slash === -1 ? full : full.slice(slash + 1);
}

function firstLine(text: string | undefined, max = 72): string | undefined {
  if (!text) return undefined;
  const line = text.split("\n")[0].trim();
  if (!line) return undefined;
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

function repoUrl(full: string | undefined): string {
  return full ? `https://github.com/${full}` : "https://github.com";
}

/**
 * Translate a raw GitHub event into a killfeed line.
 * Returns null for event types that aren't worth a line.
 */
function toFeedItem(event: GitHubEvent): FeedItem | null {
  const repo = event.repo?.name;
  const target = shortRepo(repo);
  const base = { id: event.id, target, at: event.created_at, headshot: false };
  const p = event.payload ?? {};

  switch (event.type) {
    case "PushEvent": {
      const count = p.size ?? p.commits?.length ?? 1;
      return {
        ...base,
        kind: "push",
        verb: "PUSH",
        count,
        detail: firstLine(p.commits?.[p.commits.length - 1]?.message),
        url: repoUrl(repo),
      };
    }
    case "PullRequestEvent": {
      const merged = Boolean(p.pull_request?.merged);
      if (p.action !== "opened" && !merged) return null;
      return {
        ...base,
        kind: merged ? "pr-merged" : "pr",
        verb: merged ? "MERGE" : "OPEN PR",
        detail: firstLine(p.pull_request?.title),
        headshot: merged,
        url: p.pull_request?.html_url ?? repoUrl(repo),
      };
    }
    case "CreateEvent": {
      if (p.ref_type !== "repository") return null;
      return {
        ...base,
        kind: "repo",
        verb: "NEW REPO",
        headshot: true,
        url: repoUrl(repo),
      };
    }
    case "ReleaseEvent": {
      return {
        ...base,
        kind: "release",
        verb: "RELEASE",
        detail: p.release?.tag_name,
        headshot: true,
        url: p.release?.html_url ?? repoUrl(repo),
      };
    }
    case "IssuesEvent": {
      if (p.action !== "opened" && p.action !== "closed") return null;
      return {
        ...base,
        kind: "issue",
        verb: p.action === "closed" ? "CLOSE" : "ISSUE",
        detail: firstLine(p.issue?.title),
        url: p.issue?.html_url ?? repoUrl(repo),
      };
    }
    case "WatchEvent":
      return { ...base, kind: "star", verb: "STAR", url: repoUrl(repo) };
    case "ForkEvent":
      return { ...base, kind: "fork", verb: "FORK", url: repoUrl(repo) };
    default:
      return null;
  }
}

function countPast2Weeks(events: GitHubEvent[], now: number): number {
  const cutoff = now - 14 * 24 * 60 * 60 * 1000;
  return events.filter((e) => {
    const t = Date.parse(e.created_at);
    return Number.isFinite(t) && t >= cutoff;
  }).length;
}

/**
 * One call for everything the page needs. Never throws.
 *
 * @param username GitHub handle.
 * @param limit    Max killfeed rows to return.
 */
export async function getGitHubSnapshot(
  username: string,
  limit = 12,
): Promise<GitHubSnapshot> {
  const fetchedAt = new Date().toISOString();
  const empty: GitHubSnapshot = { ok: false, error: null, stats: null, feed: [], fetchedAt };

  if (!username || username === PLACEHOLDER_GITHUB_USERNAME) {
    return { ...empty, error: "GitHub username not configured yet" };
  }

  const [user, events] = await Promise.all([
    getJson<GitHubUser>(`/users/${encodeURIComponent(username)}`),
    getJson<GitHubEvent[]>(`/users/${encodeURIComponent(username)}/events/public?per_page=100`),
  ]);

  if (!user.data) {
    return { ...empty, error: user.error ?? "GitHub profile unavailable" };
  }

  const rawEvents = Array.isArray(events.data) ? events.data : [];
  const feed = rawEvents
    .map(toFeedItem)
    .filter((item): item is FeedItem => item !== null)
    .slice(0, limit);

  return {
    ok: true,
    error: events.data ? null : events.error,
    fetchedAt,
    stats: {
      login: user.data.login,
      name: user.data.name,
      avatarUrl: user.data.avatar_url,
      profileUrl: user.data.html_url,
      publicRepos: user.data.public_repos,
      followers: user.data.followers,
      following: user.data.following,
      eventsPast2Weeks: countPast2Weeks(rawEvents, Date.parse(fetchedAt)),
    },
    feed,
  };
}
