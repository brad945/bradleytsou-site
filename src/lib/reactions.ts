/**
 * Reaction counts — the first thing on this site that is *written*, not read.
 *
 * Everything else here reads somebody else's API and caches the answer.
 * Reactions need somewhere to put a number, so this talks to an Upstash Redis
 * over its REST API.
 *
 * ## Why REST rather than a client library
 *
 * The site has three runtime dependencies (`next`, `react`, `react-dom`) and
 * this doesn't add a fourth: Upstash's REST endpoint is a plain `fetch` with a
 * bearer token, the same shape `deveval.ts` already uses. A driver would pull
 * in a connection pool this has no use for — every call here is one round trip
 * from a serverless function that immediately exits.
 *
 * ## It degrades to nothing
 *
 * Unset, unreachable, or erroring -> `null`, and the panel **hides itself
 * entirely**, exactly like the DevEval block. It never shows a zero it hasn't
 * counted, because a zero would be a claim: "we counted, and nobody reacted."
 * Absent is the truth when there's nothing to read from.
 */

/**
 * The reactions offered, in display order.
 *
 * **Keyed by an ASCII slug, not by the emoji itself.** The slug is what goes
 * in the Redis key and the request path, where a multi-byte emoji would need
 * escaping at every layer and would be a nuisance to read in a dashboard. It
 * also means changing the emoji is a display change that keeps its count,
 * rather than orphaning it under a new key.
 *
 * The server validates against this list, so a hand-written POST can't invent
 * a key and pollute the store.
 */
export const REACTIONS = [
  { slug: "fire", emoji: "🔥", label: "Fire" },
  { slug: "eyes", emoji: "👀", label: "Looking" },
  { slug: "dog", emoji: "🐶", label: "Exy" },
  { slug: "star", emoji: "⭐", label: "Star" },
] as const;

export type ReactionSlug = (typeof REACTIONS)[number]["slug"];

/** slug -> count. Always carries every slug, zero-filled. */
export type ReactionCounts = Record<string, number>;

const SLUGS = REACTIONS.map((r) => r.slug) as readonly string[];

export function isReactionSlug(value: string): value is ReactionSlug {
  return SLUGS.includes(value);
}

const KEY = (slug: string) => `reactions:${slug}`;

function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/** Whether a store is configured at all. Cheap enough to call per request. */
export function reactionsConfigured() {
  return config() !== null;
}

/**
 * One Upstash REST command.
 *
 * Commands are path segments — `/incr/reactions:fire`. Every segment is
 * encoded, because a key is user-adjacent even after validation and a stray
 * slash would silently become a different command.
 */
async function command<T>(parts: string[]): Promise<T | null> {
  const c = config();
  if (!c) return null;
  try {
    const res = await fetch(
      `${c.url}/${parts.map(encodeURIComponent).join("/")}`,
      {
        headers: { Authorization: `Bearer ${c.token}` },
        // Counts are the point; a cached one is a wrong one.
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: T };
    return body.result ?? null;
  } catch {
    // Unreachable store degrades to "no data", never to a thrown request.
    return null;
  }
}

/** Every count, zero-filled. `null` when there's no store to read. */
export async function getReactions(): Promise<ReactionCounts | null> {
  if (!config()) return null;
  const raw = await command<(string | null)[]>(["mget", ...SLUGS.map(KEY)]);
  if (raw === null) return null;

  const counts: ReactionCounts = {};
  SLUGS.forEach((slug, i) => {
    const n = Number(raw[i] ?? 0);
    // A key that has never been set reads as null; a corrupt one as NaN.
    // Both mean zero here rather than propagating a bad number upward.
    counts[slug] = Number.isFinite(n) && n > 0 ? n : 0;
  });
  return counts;
}

/** Increments one reaction and returns every count. `null` on any failure. */
export async function addReaction(
  slug: ReactionSlug,
): Promise<ReactionCounts | null> {
  if (!config()) return null;
  const next = await command<number>(["incr", KEY(slug)]);
  if (next === null) return null;
  return getReactions();
}

/**
 * A crude per-IP cap, so one person holding a key down can't invent a number.
 *
 * `INCR` then `EXPIRE` on a per-IP, per-window key: the first call in a window
 * creates it and sets the TTL, and the window then expires on its own. Not a
 * real rate limiter — it's a spam ceiling, and it fails **open**, because a
 * store hiccup should cost a lost limit rather than a broken button.
 */
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 60;

export async function withinRateLimit(ip: string): Promise<boolean> {
  if (!config()) return true;
  const key = `reactions:rate:${ip}`;
  const n = await command<number>(["incr", key]);
  if (n === null) return true;
  if (n === 1) await command(["expire", key, String(RATE_WINDOW_SECONDS)]);
  return n <= RATE_LIMIT;
}
