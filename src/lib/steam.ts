/**
 * Playtime for the favourite game, from Steam's own Web API.
 *
 * This is the panel's whole reason to exist: Steam's "Favorite Game" slot is
 * about hours, and this is the one place on the site where that number can be
 * real rather than written.
 *
 * ## Why a key is needed, when the profile is public
 *
 * It is public — the profile XML at `steamcommunity.com/id/<vanity>/?xml=1`
 * reads fine without any auth and reports `privacyState: public`. Two things
 * still block the *playtime*:
 *
 *   1. `steamcommunity.com/profiles/<id>/games?xml=1` used to return a game
 *      list with `hoursOnRecord` and no key. **It now redirects everyone to
 *      Steam's sign-in page**, regardless of the account's privacy. Steam
 *      closed that route; it isn't a setting anyone can flip back.
 *   2. `api.steampowered.com` returns 401 without `key`.
 *
 * So: a free key from https://steamcommunity.com/dev/apikey, in
 * `STEAM_API_KEY`. Without it this returns null and the panel simply omits
 * the numbers — it never invents them.
 *
 * The profile XML does expose one figure key-free, `hoursPlayed2Wk`, but it's
 * summed across every game rather than per-title, so it can't answer "how long
 * on this one" and isn't used here.
 */

/** Minutes -> hours, at Steam's own precision (one decimal). */
function hours(minutes: number | undefined): number | null {
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes < 0) {
    return null;
  }
  return Math.round((minutes / 60) * 10) / 10;
}

export interface SteamPlaytime {
  /** Lifetime hours on record. */
  total: number;
  /**
   * Hours in the last two weeks. **Zero and absent are different things** and
   * Steam conflates them: it omits `playtime_2weeks` entirely when you haven't
   * played, so this is 0 in both cases. Fine here — the panel says "past 2
   * weeks", and 0 is the honest answer either way.
   */
  past2Weeks: number;
}

export async function getSteamPlaytime(
  steamId64: string,
  appId: number,
): Promise<SteamPlaytime | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key || !steamId64) return null;

  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId64)}` +
    `&include_appinfo=0&include_played_free_games=1&format=json`;

  try {
    const res = await fetch(url, {
      // Playtime moves slowly; the page's own window is plenty.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      response?: {
        games?: { appid?: number; playtime_forever?: number; playtime_2weeks?: number }[];
      };
    };

    /*
     * An empty `response` object is what Steam returns when the key is valid
     * but **Game details** on the profile isn't public — not an error, just
     * nothing. Same handling either way: no numbers rather than wrong ones.
     */
    const game = body.response?.games?.find((g) => g.appid === appId);
    if (!game) return null;

    const total = hours(game.playtime_forever);
    if (total === null) return null;

    return { total, past2Weeks: hours(game.playtime_2weeks) ?? 0 };
  } catch {
    // Unreachable, rate-limited, or malformed: the panel drops the numbers.
    return null;
  }
}
