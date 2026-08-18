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
            className="flex items-start gap-4 border-t border-line/50 py-3 first:border-t-0"
          >
            <span
              aria-hidden
              className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center border bg-panel2/70 text-[15px] ${
                a.unlocked
                  ? "border-accent/50 text-accent"
                  : "border-line text-muted/60"
              }`}
            >
              {a.unlocked ? "★" : "☆"}
            </span>

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
            {a.date && (
              <span className="t-meta shrink-0 pt-0.5">{a.date}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
