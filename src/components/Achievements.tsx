import { achievements } from "@/lib/about-data";

/**
 * Steam's achievement list, with real milestones.
 *
 * **No rarity percentages, deliberately.** Steam shows "12.4% of players have
 * this" and that figure is measured; here it could only be invented, and an
 * invented percentage sitting next to real dates would undermine both.
 *
 * The locked row is the point of the panel, not a gap in it — a full sheet
 * says nothing about what happens next.
 */
export default function Achievements() {
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <section aria-labelledby="achievements-heading" className="panel">
      <div className="panel-bar">
        <h2 id="achievements-heading" className="panel-bar-title">
          Achievements
        </h2>
        <span className="panel-bar-meta">
          {unlocked} of {achievements.length} unlocked
        </span>
      </div>

      <ul className="flex flex-col px-5">
        {achievements.map((a) => (
          <li
            key={a.name}
            className="flex items-start gap-4 border-t border-line/50 py-2.5 first:border-t-0"
          >
            {/*
              No star tile, at Bradley's request. `unlocked` is still what the
              panel bar counts and still greys a locked row's name, so the
              distinction survives — it just no longer has an icon of its own.
              With every row unlocked today there is nothing for one to mark
              anyway, and a column of identical stars is decoration.
            */}
            <div className="min-w-0 flex-1">
              <span
                className={`block text-[15px] leading-tight ${
                  a.unlocked ? "text-bright" : "text-muted"
                }`}
              >
                {a.name}
              </span>
              <span className="t-meta mt-0.5 block leading-snug">
                {a.detail}
              </span>
            </div>

            {/* Nothing rather than a dash when it isn't unlocked — the row
                already says so twice. */}
            {a.date && <span className="t-meta shrink-0 pt-0.5">{a.date}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
