/**
 * Recently played tracks, from Spotify.
 *
 * ## Why this needs three secrets and GitHub needed one
 *
 * Spotify has no public read for someone's listening history — it's personal
 * data, so every call is on behalf of a *user*, not an app. That means OAuth,
 * and OAuth access tokens last an hour, which is no use to a server that wakes
 * up on a request months later.
 *
 * The way round it is the standard one for a personal site: authorise **once**
 * by hand, keep the long-lived refresh token as a secret, and trade it for a
 * fresh access token on each render. So:
 *
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *
 * All three, or this returns null and the block **hides itself entirely** —
 * the same contract as the DevEval panel. It never shows an empty shelf.
 *
 * ## Recently played, not "now playing"
 *
 * `now playing` is empty most of the time, and a panel that's blank whenever
 * he isn't listening is a panel that's usually blank. Recently played always
 * has something and reads the same as the GitHub rows beside it: a list of
 * things, most recent first.
 */

export interface Track {
  title: string;
  artist: string;
  url: string;
  /** ISO timestamp of when it finished playing. */
  playedAt: string;
}

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=50";

function config() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) return null;
  return { id, secret, refresh };
}

/**
 * Trades the refresh token for an access token.
 *
 * The client id and secret go in a Basic header rather than the body — both
 * forms are in the spec, but Spotify rejects the body form for some app types
 * and the header works for all of them.
 */
async function accessToken(): Promise<string | null> {
  const c = config();
  if (!c) return null;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${c.id}:${c.secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: c.refresh,
      }),
      // Access tokens last an hour; caching one for the page's window is safe
      // and saves a round trip on every render.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { access_token?: string };
    return body.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * The most recent DISTINCT tracks, newest first.
 *
 * `limit` counts tracks after deduping, not plays — which is why the request
 * above asks Spotify for 50. One song on repeat fills its history with itself,
 * and at the 10 this used to ask for, an evening of that returned a single row
 * no matter what `limit` said. 50 is Spotify's maximum for this endpoint.
 *
 * That is not always enough, because it can't be: if the last 50 plays are all
 * one track then one row is the honest answer, and the panel shows one. It did
 * exactly that on 19 Aug 2026 — the endpoint returned a single entry in total.
 */
export async function getRecentTracks(limit = 3): Promise<Track[]> {
  const token = await accessToken();
  if (!token) return [];

  try {
    const res = await fetch(RECENT_URL, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];

    const body = (await res.json()) as {
      items?: {
        played_at?: string;
        track?: {
          name?: string;
          external_urls?: { spotify?: string };
          artists?: { name?: string }[];
        };
      }[];
    };

    const seen = new Set<string>();
    const out: Track[] = [];

    for (const item of body.items ?? []) {
      const t = item.track;
      const title = t?.name;
      const url = t?.external_urls?.spotify;
      if (!title || !url || !item.played_at) continue;

      /*
       * Spotify returns one entry per play, so a track on repeat fills the
       * whole list with itself. Deduped by URL, keeping the most recent — the
       * list is meant to show what he's been listening to, not how many times
       * in a row.
       */
      if (seen.has(url)) continue;
      seen.add(url);

      out.push({
        title,
        artist: (t?.artists ?? [])
          .map((a) => a.name)
          .filter(Boolean)
          .join(", "),
        url,
        playedAt: item.played_at,
      });
      if (out.length >= limit) break;
    }

    return out;
  } catch {
    return [];
  }
}
