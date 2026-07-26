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
  publicGists: number;
  followers: number;
  following: number;
  /** Year the account was created — the "member since" row. */
  memberSince: number | null;
  /** Public events in the last 14 days — the "hours past 2 weeks" analogue. */
  eventsPast2Weeks: number;
}

/** A recently-pushed repo, rendered in the "recently played" slot. */
export interface RepoCard {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  url: string;
  /** Commits pushed to this repo in the last 14 days, from the events feed. */
  commitsPast2Weeks: number;
}

/** Language usage across owned repos — the sidebar's breakdown block. */
export interface LanguageCount {
  name: string;
  repos: number;
}

export interface GitHubSnapshot {
  ok: boolean;
  /** Human-readable reason the snapshot is empty, or null. */
  error: string | null;
  stats: GitHubStats | null;
  feed: FeedItem[];
  /** Most recently pushed, for the "recently played" rows. */
  repos: RepoCard[];
  /** Most starred, for the sidebar list. */
  topRepos: RepoCard[];
  /**
   * Names of the owner's repos that came back from the public API. The
   * unauthenticated endpoint only returns public repos, so membership here is
   * a reliable "is this repo visible to a visitor" check — which is what stops
   * the header linking a private repo nobody else can open.
   */
  publicRepoNames: string[];
  languages: LanguageCount[];
  /** When this snapshot was built, ISO. */
  fetchedAt: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  html_url: string;
  fork: boolean;
  archived: boolean;
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

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function countPast2Weeks(events: GitHubEvent[], now: number): number {
  const cutoff = now - TWO_WEEKS_MS;
  return events.filter((e) => {
    const t = Date.parse(e.created_at);
    return Number.isFinite(t) && t >= cutoff;
  }).length;
}

/** Commits per repo (short name) pushed in the last 14 days. */
function commitsByRepo(events: GitHubEvent[], now: number): Map<string, number> {
  const cutoff = now - TWO_WEEKS_MS;
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.type !== "PushEvent") continue;
    const t = Date.parse(event.created_at);
    if (!Number.isFinite(t) || t < cutoff) continue;

    const name = shortRepo(event.repo?.name);
    const size = event.payload?.size ?? event.payload?.commits?.length ?? 1;
    counts.set(name, (counts.get(name) ?? 0) + size);
  }

  return counts;
}

/**
 * One call for everything the page needs. Never throws.
 *
 * @param username  GitHub handle.
 * @param limit     Max killfeed rows to return.
 * @param repoLimit Max recently-pushed repo cards to return.
 */
export async function getGitHubSnapshot(
  username: string,
  limit = 12,
  repoLimit = 3,
): Promise<GitHubSnapshot> {
  const fetchedAt = new Date().toISOString();
  const empty: GitHubSnapshot = {
    ok: false,
    error: null,
    stats: null,
    feed: [],
    repos: [],
    topRepos: [],
    publicRepoNames: [],
    languages: [],
    fetchedAt,
  };

  if (!username || username === PLACEHOLDER_GITHUB_USERNAME) {
    return { ...empty, error: "GitHub username not configured yet" };
  }

  const handle = encodeURIComponent(username);
  const [user, events, repos] = await Promise.all([
    getJson<GitHubUser>(`/users/${handle}`),
    getJson<GitHubEvent[]>(`/users/${handle}/events/public?per_page=100`),
    getJson<GitHubRepo[]>(`/users/${handle}/repos?type=owner&sort=pushed&per_page=12`),
  ]);

  if (!user.data) {
    return { ...empty, error: user.error ?? "GitHub profile unavailable" };
  }

  const rawEvents = Array.isArray(events.data) ? events.data : [];
  const feed = rawEvents
    .map(toFeedItem)
    .filter((item): item is FeedItem => item !== null)
    .slice(0, limit);

  // Forks and archives would dominate the "recently played" slot without
  // saying anything about what Bradley is actually working on.
  const commits = commitsByRepo(rawEvents, Date.parse(fetchedAt));
  const owned: RepoCard[] = (Array.isArray(repos.data) ? repos.data : [])
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
      url: r.html_url,
      commitsPast2Weeks: commits.get(r.name) ?? 0,
    }));

  // The API already returned these sorted by push date.
  const repoCards = owned.slice(0, repoLimit);
  const topRepos = [...owned].sort((a, b) => b.stars - a.stars).slice(0, 6);

  const languageCounts = new Map<string, number>();
  for (const repo of owned) {
    if (!repo.language) continue;
    languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }
  const languages: LanguageCount[] = Array.from(languageCounts, ([name, count]) => ({
    name,
    repos: count,
  }))
    .sort((a, b) => b.repos - a.repos)
    .slice(0, 5);

  const createdAt = Date.parse(user.data.created_at);

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
      publicGists: user.data.public_gists,
      followers: user.data.followers,
      following: user.data.following,
      memberSince: Number.isFinite(createdAt) ? new Date(createdAt).getUTCFullYear() : null,
      eventsPast2Weeks: countPast2Weeks(rawEvents, Date.parse(fetchedAt)),
    },
    feed,
    repos: repoCards,
    topRepos,
    publicRepoNames: (Array.isArray(repos.data) ? repos.data : []).map((r) => r.name),
    languages,
  };
}

/* ------------------------------------------------------------------ *
 * Contribution calendar
 * ------------------------------------------------------------------ */

/** One week of the contribution calendar. */
export interface ContributionWeek {
  /** ISO date of the week's first day. */
  start: string;
  count: number;
}

export interface Contributions {
  /** Total contributions in the trailing year. */
  total: number;
  weeks: ContributionWeek[];
  /** Busiest single week, used to scale the bars. */
  busiest: number;
}

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

interface CalendarResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: { contributionDays?: { date?: string; contributionCount?: number }[] }[];
        };
      };
    };
  };
}

/**
 * The contribution calendar, GitHub's closest thing to Steam's "hours played".
 *
 * Only available over GraphQL, which is auth-only — so this needs
 * `GITHUB_TOKEN` and returns null without it. Private contributions are
 * included only when the account has "Include private contributions on my
 * profile" enabled; with it off the total collapses to public activity alone,
 * which for a mostly-private account is a near-flat chart.
 *
 * Never throws: no token, non-OK, GraphQL errors, or an unexpected shape all
 * return null and the panel hides itself.
 */
export async function getContributions(username: string): Promise<Contributions | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token || !username || username === PLACEHOLDER_GITHUB_USERNAME) return null;

  let body: CalendarResponse;
  try {
    const res = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "bradleytsou-site",
      },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: username } }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    body = (await res.json()) as CalendarResponse;
  } catch {
    return null;
  }

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;
  const rawWeeks = calendar?.weeks;
  if (!Array.isArray(rawWeeks) || rawWeeks.length === 0) return null;

  const weeks: ContributionWeek[] = rawWeeks.map((week) => {
    const days = Array.isArray(week.contributionDays) ? week.contributionDays : [];
    return {
      start: days[0]?.date ?? "",
      count: days.reduce((sum, day) => sum + (day.contributionCount ?? 0), 0),
    };
  });

  const busiest = weeks.reduce((max, week) => Math.max(max, week.count), 0);
  if (busiest === 0) return null; // a flat chart says nothing — show nothing

  return {
    total: calendar?.totalContributions ?? weeks.reduce((s, w) => s + w.count, 0),
    weeks,
    busiest,
  };
}

/* ------------------------------------------------------------------ *
 * Featured repositories
 * ------------------------------------------------------------------ */

export interface FeaturedRepo {
  nameWithOwner: string;
  name: string;
  owner: string;
  isPrivate: boolean;
  url: string;
  description: string | null;
  language: string | null;
  pushedAt: string;
  stars: number;
  /** Commits authored by the profile owner. */
  myCommits: number;
  /** Commits in the repo by everyone. */
  totalCommits: number;
}

/**
 * Hand-picked repos for the "recently played" slot.
 *
 * Needed because the automatic list can only see public repos Bradley *owns*,
 * which misses both his private work and the repos he contributes to as a
 * collaborator — i.e. almost everything that matters.
 *
 * Commits are reported as "yours / total", never just the repo total: on a
 * shared repo the total says nothing about his contribution, and overstating
 * it is the kind of thing a reader can check.
 *
 * Needs `GITHUB_TOKEN` (private repos and the author filter both require auth).
 * Returns an empty array without one, and the caller falls back to the public
 * list rather than showing nothing.
 */
export async function getFeaturedRepos(names: string[]): Promise<FeaturedRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token || names.length === 0) return [];

  const gql = async (query: string, variables?: Record<string, unknown>) => {
    const res = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "bradleytsou-site",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as { data?: Record<string, any> };
  };

  try {
    // The author filter takes a node id, which can't be derived in the same
    // document, so the viewer lookup is a separate (cached) round trip.
    const me = await gql(`query { viewer { id } }`);
    const viewerId = me?.data?.viewer?.id;
    if (!viewerId) return [];

    const parsed = names
      .map((full) => {
        const [owner, name] = full.split("/");
        return owner && name ? { owner, name } : null;
      })
      .filter((x): x is { owner: string; name: string } => x !== null);
    if (parsed.length === 0) return [];

    const fields = parsed
      .map(
        (r, i) =>
          `r${i}: repository(owner: ${JSON.stringify(r.owner)}, name: ${JSON.stringify(r.name)}) { ...S }`,
      )
      .join("\n");

    const body = await gql(
      `query($who: ID!) {
         ${fields}
       }
       fragment S on Repository {
         nameWithOwner name owner { login } isPrivate url description pushedAt stargazerCount
         primaryLanguage { name }
         defaultBranchRef { target { ... on Commit {
           all: history { totalCount }
           mine: history(author: {id: $who}) { totalCount }
         } } }
       }`,
      { who: viewerId },
    );

    const data = body?.data;
    if (!data) return [];

    const out: FeaturedRepo[] = [];
    parsed.forEach((_, i) => {
      const r = data[`r${i}`];
      if (!r) return; // repo renamed, deleted, or no longer visible to the token
      const target = r.defaultBranchRef?.target;
      out.push({
        nameWithOwner: r.nameWithOwner,
        name: r.name,
        owner: r.owner?.login ?? "",
        isPrivate: Boolean(r.isPrivate),
        url: r.url,
        description: r.description ?? null,
        language: r.primaryLanguage?.name ?? null,
        pushedAt: r.pushedAt ?? "",
        stars: r.stargazerCount ?? 0,
        myCommits: target?.mine?.totalCount ?? 0,
        totalCommits: target?.all?.totalCount ?? 0,
      });
    });
    return out;
  } catch {
    return [];
  }
}
