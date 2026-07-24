import Image from "next/image";
import type { GitHubStats } from "@/lib/github";
import { badges, experience, profile, socials } from "@/lib/profile-data";

interface ProfileHeaderProps {
  stats: GitHubStats | null;
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

export default function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { level, progress, sinceYear } = experience();
  const avatar = stats?.avatarUrl ?? null;
  const profileUrl = stats?.profileUrl ?? null;

  return (
    <header className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Identity card */}
      <div className="panel bg-panel-sheen p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="h-24 w-24 overflow-hidden rounded-panel border border-line bg-panel2">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${profile.name} avatar`}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-2xl text-muted">
                  {profile.initials}
                </div>
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-panel bg-live shadow-live-dot"
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <span className="font-mono text-xs text-muted">{profile.handle}</span>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-live">
                {profile.status.label}
              </span>
              <span className="text-[11px] text-muted">— {profile.status.detail}</span>
            </div>

            <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/85">
              {profile.tagline}
            </p>

            <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="label pt-[3px]">Focus</dt>
                <dd className="text-ink/80">{profile.currentFocus}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="label pt-[3px]">Based</dt>
                <dd className="text-ink/80">{profile.location}</dd>
              </div>
            </dl>

            <nav className="mt-4 flex flex-wrap gap-2">
              {socials.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="rounded border border-line bg-panel2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
              {profileUrl && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-line bg-panel2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {stats?.publicRepos} repos
                </a>
              )}
            </nav>
          </div>
        </div>

        {/* Badges — each one maps to a dated milestone, not a decoration. */}
        <div className="mt-6 border-t border-line pt-4">
          <p className="label">Badges</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <li
                key={badge.name}
                title={`${badge.description} · ${formatEarned(badge.earned)}`}
                className="flex items-center gap-2 rounded border border-line bg-panel2 px-2.5 py-1.5"
              >
                <span className="text-accent" aria-hidden>
                  {badge.glyph}
                </span>
                <span className="text-xs text-ink/85">{badge.name}</span>
                <span className="font-mono text-[10px] text-muted">
                  {formatEarned(badge.earned)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Level card — level is literally years since the first commit. */}
      <aside className="panel bg-panel-sheen p-5">
        <p className="label">Experience</p>

        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-5xl font-semibold leading-none text-ink">
            {level}
          </span>
          <span className="pb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            years
            <br />
            writing code
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <span>Level {level}</span>
            <span>{progress}% to {level + 1}</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-base ring-1 ring-inset ring-line"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress to year ${level + 1}`}
          >
            <div className="h-full rounded-full bg-xp-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 font-mono text-[10px] text-muted">
            Since {sinceYear}. Counts up on its own — nothing to maintain.
          </p>
        </div>

        {stats && (
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <dt className="label">Followers</dt>
              <dd className="mt-1 font-mono text-lg text-ink">{stats.followers}</dd>
            </div>
            <div>
              <dt className="label">Following</dt>
              <dd className="mt-1 font-mono text-lg text-ink">{stats.following}</dd>
            </div>
          </dl>
        )}
      </aside>
    </header>
  );
}
