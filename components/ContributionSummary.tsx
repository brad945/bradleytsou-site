import type { Contributions } from "@/lib/github";

/**
 * Contributions as a set of counts rather than a chart.
 *
 * The bar chart this replaced showed *when* the work happened but never what
 * it was. These numbers answer the second question, which is the one a reader
 * actually has.
 *
 * The type breakdown comes from author-scoped search, not from
 * `contributionsCollection.total*Contributions` — those count public
 * contributions only, so for a mostly-private account they report
 * "0 pull requests" while the person has opened plenty.
 */
export default function ContributionSummary({
  contributions,
}: {
  contributions: Contributions;
}) {
  const {
    total,
    pullRequests,
    pullRequestsMerged,
    issues,
    reviews,
    repositoriesCreated,
  } = contributions;

  const rows: { label: string; value: string }[] = [
    {
      label: "Pull requests opened",
      value:
        pullRequests > 0 && pullRequestsMerged === pullRequests
          ? `${pullRequests} — all merged`
          : pullRequests > 0
            ? `${pullRequests} — ${pullRequestsMerged} merged`
            : "0",
    },
    { label: "Pull requests reviewed", value: String(reviews) },
    { label: "Issues opened", value: String(issues) },
    { label: "Repositories created", value: String(repositoriesCreated) },
  ];

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
        <ul className="flex flex-col divide-y divide-line/50">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-baseline justify-between gap-3 py-2.5"
            >
              <span className="t-label">{row.label}</span>
              <span className="text-[17px] font-light leading-none text-ink">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
