import type { GitHubSnapshot } from "@/lib/github";
import { badges, monogram, profile, socials } from "@/lib/profile-data";

interface SidebarProps {
  snapshot: GitHubSnapshot;
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

function daysAgo(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "unknown";
  const days = Math.floor((now - then) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Pushed today";
  if (days === 1) return "Pushed 1 day ago";
  return `Pushed ${days} days ago`;
}

/** A grey label with a large light number, Steam's sidebar stat row. */
function Stat({ label, value }: { label: string; value?: number | string | null }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      {value !== null && value !== undefined && <span className="stat-value">{value}</span>}
    </div>
  );
}

export default function Sidebar({ snapshot }: SidebarProps) {
  const { stats, topRepos, languages, fetchedAt } = snapshot;
  const now = Date.parse(fetchedAt);
  const maxLanguageRepos = Math.max(...languages.map((l) => l.repos), 1);

  return (
    <div className="flex flex-col gap-4">
      <section className="panel px-4 py-4">
        <h2 className="text-[22px] font-light leading-tight text-live">
          Currently {profile.status.label}
        </h2>
        <p className="mt-0.5 text-[14px] text-muted">{profile.status.detail}</p>

        <div className="mt-5">
          <Stat label="Public Repos" value={stats?.publicRepos ?? "—"} />
          <Stat label="Followers" value={stats?.followers ?? "—"} />
          <Stat label="Following" value={stats?.following ?? "—"} />
          <Stat label="Gists" value={stats?.publicGists ?? "—"} />
          <Stat label="Member Since" value={stats?.memberSince ?? "—"} />
        </div>

        <div className="mt-5">
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
                <span className="text-[17px] leading-none text-accent" aria-hidden>
                  {badge.glyph}
                </span>
                <span className="px-1 text-center text-[8px] uppercase leading-tight tracking-wide text-muted">
                  {badge.name.split(" ")[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <div className="stat-row">
            <span className="stat-label">Focus</span>
          </div>
          <p className="text-[14px] leading-snug text-ink/75">{profile.currentFocus}</p>
        </div>
      </section>

      {languages.length > 0 && (
        <section className="panel px-4 py-4">
          <div className="stat-row">
            <span className="stat-label">Languages</span>
            <span className="stat-value">{languages.length}</span>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {languages.map((language) => (
              <li key={language.name}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] text-ink/80">{language.name}</span>
                  <span className="text-[12px] text-muted">
                    {language.repos} {language.repos === 1 ? "repo" : "repos"}
                  </span>
                </div>
                <div className="mt-1 h-[5px] overflow-hidden bg-base/70">
                  <div
                    className="h-full bg-link/55"
                    style={{ width: `${Math.round((language.repos / maxLanguageRepos) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topRepos.length > 0 && (
        <section className="panel px-4 py-4">
          <div className="stat-row">
            <span className="stat-label">Top Repositories</span>
            <span className="stat-value">{topRepos.length}</span>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {topRepos.map((repo) => (
              <li key={repo.id}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 py-1"
                >
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border border-line bg-base/60 text-[12px] text-link/80">
                    {monogram(repo.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="steam-link block truncate text-[14px] leading-tight">
                      {repo.name}
                    </span>
                    <span className="block text-[12px] leading-tight text-muted">
                      {daysAgo(repo.pushedAt, now)}
                    </span>
                  </span>
                  <span
                    className="flex h-[26px] min-w-[34px] shrink-0 items-center justify-center border border-accent/50 px-1 text-[12px] text-accent"
                    title={`${repo.stars} stars`}
                  >
                    {repo.stars.toLocaleString()}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel px-4 py-4">
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
                className="steam-link block py-1.5 text-[15px]"
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
