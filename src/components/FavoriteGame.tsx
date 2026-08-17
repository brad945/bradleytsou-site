import type { SteamPlaytime } from "@/lib/steam";
import { favoriteGame, steamProfileUrl } from "@/lib/profile-data";

/**
 * Steam's "Favorite Game" slot, holding an actual game.
 *
 * **This replaced Favorite Project**, which held DevEval — already the first
 * row of Experience & Projects, so the panel restated something the page had
 * just said. A favourite game is the thing the slot is for, and it's the one
 * fact here that nothing else on the page carries.
 *
 * ## The numbers
 *
 * Hours come from Steam's Web API — see `lib/steam.ts` for why that needs a
 * key even though the profile is public. **Without them the panel still
 * renders**, minus the stat row: the favourite is hand-picked and true whether
 * or not the hours are reachable, so hiding the whole thing would lose a real
 * fact to protect a missing one. That's the opposite call from the DevEval
 * block, which is *only* numbers and so has nothing left to show.
 *
 * "hours on record" and "past 2 weeks" are Steam's own labels, deliberately —
 * the second is a figure Steam puts in exactly this slot, and renaming it
 * would break the one thing a visitor already knows how to read.
 */
export default function FavoriteGame({
  playtime,
}: {
  /** Null when STEAM_API_KEY is unset or the lookup failed. */
  playtime: SteamPlaytime | null;
}) {
  const { name, studio, released, blurb } = favoriteGame;

  return (
    <section aria-labelledby="favorite-game-heading" className="panel">
      <div className="panel-bar">
        <h2 id="favorite-game-heading" className="panel-bar-title">
          Favorite Game
        </h2>
        {/* Says where the numbers come from, and only when there are any. */}
        {playtime && <span className="panel-bar-meta">live from Steam</span>}
      </div>

      <div className="flex gap-4 p-5">
        {/*
          A generated capsule, not Steam's cover art. The site's carve-out on
          resembling Steam is explicit about this: no game capsule art, every
          tile built from the palette. `shrink-0` so it can't be squeezed when
          the name wraps.
        */}
        <div
          aria-hidden
          className="flex h-[84px] w-[84px] shrink-0 items-center justify-center border border-accent/50 bg-panel2/70 text-[22px] font-light text-accent"
        >
          CS2
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-[19px] font-light leading-tight text-bright">
              {name}
            </h3>
            <span className="t-meta">
              {studio} · {released}
            </span>
          </div>

          <p className="t-body mt-1.5">{blurb}</p>

          {playtime && (
            <div className="mt-3 flex flex-wrap items-baseline gap-x-8 gap-y-1">
              {[
                { value: playtime.total, label: "hours on record" },
                { value: playtime.past2Weeks, label: "past 2 weeks" },
              ].map(({ value, label }) => (
                <span key={label} className="flex items-baseline gap-2">
                  {/*
                    `toLocaleString` for the thousands separator, and tabular
                    figures so the pair doesn't shift when the numbers change.
                  */}
                  <span className="text-[24px] font-light leading-none tabular-nums text-ink">
                    {value.toLocaleString()}
                  </span>
                  <span className="t-meta">{label}</span>
                </span>
              ))}
            </div>
          )}

          {steamProfileUrl && (
            <div className="mt-3 flex justify-end">
              <a
                href={steamProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="steam-link text-[14px]"
              >
                View on Steam
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
