import type { Contributions } from "@/lib/github";

interface ContributionChartProps {
  contributions: Contributions;
}

function monthLabel(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * GitHub's contribution calendar as a playtime-style bar chart — the closest
 * honest analogue to the hours graph Steam shows on a game's page.
 *
 * Bars are weekly totals scaled against the busiest week rather than a fixed
 * ceiling, so a quiet year still reads rather than flattening to nothing. A
 * genuinely empty calendar returns null upstream, so this never renders a row
 * of zero-height bars.
 */
export default function ContributionChart({
  contributions,
}: ContributionChartProps) {
  const { total, weeks, busiest } = contributions;

  // One label per month, placed on the first week that lands in a new month.
  let lastMonth = "";
  const labels = weeks.map((week) => {
    const month = monthLabel(week.start);
    if (month && month !== lastMonth) {
      lastMonth = month;
      return month;
    }
    return null;
  });

  return (
    <section aria-labelledby="contributions-heading" className="panel">
      <div className="panel-bar">
        <h2 id="contributions-heading" className="panel-bar-title">
          Contributions
        </h2>
        <span className="panel-bar-meta">
          {total.toLocaleString()} in the last year
        </span>
      </div>

      <div className="p-5">
        <div
          className="flex h-[84px] items-end gap-[3px]"
          role="img"
          aria-label={`${total} contributions over the last year, busiest week ${busiest}`}
        >
          {weeks.map((week, i) => {
            // Floor at 2% so a week with 1 contribution is still visible.
            const height =
              week.count === 0 ? 0 : Math.max(2, (week.count / busiest) * 100);
            return (
              <span
                key={week.start || i}
                title={`Week of ${week.start}: ${week.count}`}
                className="min-w-0 flex-1 bg-line/40"
                style={{ height: "100%" }}
              >
                <span className="flex h-full w-full items-end">
                  <span
                    className={week.count > 0 ? "w-full bg-live/70" : "w-full"}
                    style={{ height: `${height}%` }}
                  />
                </span>
              </span>
            );
          })}
        </div>

        <div className="mt-1.5 flex gap-[3px]">
          {labels.map((label, i) => (
            <span
              key={i}
              className="t-meta min-w-0 flex-1 text-[10px] leading-none"
            >
              {label}
            </span>
          ))}
        </div>

        <p className="t-meta mt-3">
          Weekly totals, scaled against the busiest week (
          {busiest.toLocaleString()}). Includes private contributions.
        </p>
      </div>
    </section>
  );
}
