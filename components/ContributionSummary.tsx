import type { Contributions } from "@/lib/github";

/**
 * Contributions as counts, in the sidebar.
 *
 * A weekly bar chart lived here first; it showed *when* the work happened but
 * never what it was, which is the question a reader actually has.
 *
 * The type breakdown comes from author-scoped search, not from
 * `contributionsCollection.total*Contributions` — those count public
 * contributions only, so for a mostly-private account they report
 * "0 pull requests" while the person has opened plenty.
 *
 * Labels are short on purpose: this sits in the 308px column alongside
 * "Public Repos" and "Followers", and long ones wrap.
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

  const rows: { label: string; value: number }[] = [
    { label: "Pull Requests", value: pullRequests },
    { label: "Merged", value: pullRequestsMerged },
    { label: "Reviews", value: reviews },
    { label: "Issues", value: issues },
    { label: "Repos Created", value: repositoriesCreated },
  ];

  return (
    <section
      aria-labelledby="contributions-heading"
      className="panel px-5 py-5"
    >
      <div className="stat-row">
        <span id="contributions-heading" className="stat-label">
          Contributions
        </span>
        <span className="stat-value">{total.toLocaleString()}</span>
      </div>
      <p className="t-meta -mt-1">Past year</p>

      <div className="mt-4">
        {rows.map((row) => (
          <div key={row.label} className="stat-row">
            <span className="stat-label">{row.label}</span>
            <span className="stat-value">{row.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
