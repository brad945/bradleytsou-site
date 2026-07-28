import { CODEARENA_ROWS, type CodeArenaStats } from "@/lib/codearena";
import ContributionSummary from "@/components/ContributionSummary";
import type { Contributions, LanguageCount } from "@/lib/github";
import type { GitHubSnapshot } from "@/lib/github";
import { badges, profile, socials } from "@/lib/profile-data";

interface SidebarProps {
  snapshot: GitHubSnapshot;
  /** Null when CODEARENA_STATS_URL isn't set or the endpoint is unreachable. */
  codearena: CodeArenaStats | null;
  /** Null without a token — GraphQL is auth-only. */
  contributions: Contributions | null;
  /** All-repo breakdown. Empty without a token — falls back to public-only. */
  languages: LanguageCount[];
}

/**
 * Badge dates are bare `YYYY-MM-DD`, which JS parses as midnight UTC — format
 * in UTC too, or anyone west of Greenwich sees the previous month.
 */
function formatEarned(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** A grey label with a large light number, Steam's sidebar stat row. */
function Stat({
  label,
  value,
}: {
  label: string;
  value?: number | string | null;
}) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      {value !== null && value !== undefined && (
        <span className="stat-value">{value}</span>
      )}
    </div>
  );
}

export default function Sidebar({
  snapshot,
  codearena,
  contributions,
  languages,
}: SidebarProps) {
  const { stats } = snapshot;
  // The token-backed breakdown sees private repos and every language per repo;
  // the snapshot's is public-only primaryLanguage and reads far too narrow.
  const langs = languages.length > 0 ? languages : snapshot.languages;

  return (
    <div className="flex flex-col gap-4">
      <section className="panel px-5 py-5">
        <h2 className="text-[24px] font-light leading-tight text-live">
          Currently {profile.status.label}
        </h2>
        <p className="t-label mt-1">{profile.status.detail}</p>

        <div className="mt-7">
          <Stat label="Public Repos" value={stats?.publicRepos ?? "—"} />
          <Stat label="Followers" value={stats?.followers ?? "—"} />
          <Stat label="Following" value={stats?.following ?? "—"} />
          <Stat label="Gists" value={stats?.publicGists ?? "—"} />
          <Stat label="Member Since" value={stats?.memberSince ?? "—"} />
        </div>

        <div className="mt-7">
          <div className="stat-row">
            <span className="stat-label">Badges</span>
            <span className="stat-value">{badges.length}</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <li
                key={badge.name}
                title={`${badge.name} — ${badge.description} · ${formatEarned(badge.earned)}`}
                className="flex h-[52px] w-[52px] flex-col items-center justify-center gap-0.5 border border-line bg-base/60"
              >
                <span
                  className="text-[17px] leading-none text-accent"
                  aria-hidden
                >
                  {badge.glyph}
                </span>
                <span className="px-1 text-center text-[8px] uppercase leading-tight tracking-wide text-muted">
                  {badge.name.split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7">
          <div className="stat-row">
            <span className="stat-label">Focus</span>
          </div>
          <p className="t-body leading-snug">{profile.currentFocus}</p>
        </div>
      </section>

      {contributions && <ContributionSummary contributions={contributions} />}

      {/*
        The one block on this page fed by Bradley's own product rather than
        someone else's API. Absent entirely when the endpoint isn't configured
        or is down — never a placeholder number.
      */}
      {codearena && (
        <section className="panel px-5 py-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-normal leading-tight text-bright">
              CodeArena
            </h2>
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live"
                aria-hidden
              />
              <span className="t-meta text-live">Live</span>
            </span>
          </div>
          <p className="t-meta mt-1">Straight off the CodeArena API.</p>

          <div className="mt-4">
            {CODEARENA_ROWS.map(({ key, label }) =>
              codearena[key] === undefined ? null : (
                <div key={key} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value">
                    {codearena[key]!.toLocaleString()}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {langs.length > 0 && (
        <section className="panel px-5 py-5">
          <div className="stat-row">
            <span className="stat-label">Languages</span>
            <span className="stat-value">{langs.length}</span>
          </div>
          {/*
            A plain list, not bars. Bars here were scaled against the most-used
            language, which is an arbitrary denominator that conveys nothing —
            the repo count already says everything the bar was implying.
          */}
          <ul className="mt-2 flex flex-col">
            {langs.map((language) => (
              <li
                key={language.name}
                className="flex items-baseline justify-between gap-2 py-1"
              >
                <span className="t-body">{language.name}</span>
                <span className="t-meta">
                  {language.repos} {language.repos === 1 ? "repo" : "repos"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel px-5 py-5">
        <div className="stat-row">
          <span className="stat-label">Links</span>
          <span className="stat-value">{socials.length}</span>
        </div>
        <ul className="mt-2 flex flex-col">
          {socials.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="steam-link block py-1.5 text-[14px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
