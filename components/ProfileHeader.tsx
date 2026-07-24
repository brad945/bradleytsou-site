import Image from "next/image";
import NameHistory from "@/components/NameHistory";
import type { GitHubStats } from "@/lib/github";
import { aliases, experience, profile } from "@/lib/profile-data";

interface ProfileHeaderProps {
  stats: GitHubStats | null;
}

/**
 * The bouncing screensaver mark. Drawn here from primitives — skewed wordmark
 * over a flattened ellipse — rather than embedding the real logo file.
 * Everything paints with `currentColor`, so the `dvd-tint` animation on the
 * wrapper is what changes its colour, and nothing else on the frame moves.
 */
function DvdLogo() {
  return (
    <svg
      width="46"
      height="26"
      viewBox="0 0 46 26"
      fill="none"
      className="block animate-dvd-tint drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]"
      aria-hidden
    >
      <g transform="skewX(-12) translate(4 0)">
        <text
          x="20"
          y="14"
          textAnchor="middle"
          fill="currentColor"
          fontSize="14"
          fontWeight="800"
          fontFamily="var(--font-sans), sans-serif"
          letterSpacing="-0.5"
        >
          DVD
        </text>
      </g>
      <ellipse cx="23" cy="19" rx="16" ry="4.6" stroke="currentColor" strokeWidth="2.4" />
      <text
        x="23"
        y="21.2"
        textAnchor="middle"
        fill="currentColor"
        fontSize="4.6"
        fontWeight="700"
        fontFamily="var(--font-sans), sans-serif"
        letterSpacing="0.3"
      >
        VIDEO
      </text>
    </svg>
  );
}

export default function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { level, progress, sinceYear } = experience();
  const avatar = stats?.avatarUrl ?? null;

  // The header deliberately has no `overflow-hidden`: it would clip the alias
  // dropdown. The gradient overlay is absolute inset-0, so it can't spill.
  return (
    <header className="relative bg-profile-hero">
      {/* Darkens the left half so the name always has contrast over the art. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/70 via-base/20 to-transparent"
        aria-hidden
      />

      <div className="relative grid gap-6 p-5 lg:grid-cols-[2fr_1fr]">
        {/* Identity */}
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="shrink-0">
            {/* Static brushed-grey frame with a dark inner edge, per the
                reference. w-fit keeps it square when the header stacks. */}
            <div className="w-fit bg-avatar-frame p-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              <div className="relative h-[150px] w-[150px] overflow-hidden bg-base ring-1 ring-inset ring-base/90">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={`${profile.name} avatar`}
                    width={150}
                    height={150}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-light text-muted">
                    {profile.initials}
                  </div>
                )}

                {/*
                  DVD-screensaver bounce. Two nested spans because one element
                  can carry only one transform animation. Travel distances are
                  baked into the keyframes against this 150px box and the 46x26
                  logo — resize one and you must resize the other.
                */}
                <span
                  className="pointer-events-none absolute left-0 top-0 animate-dvd-x"
                  aria-hidden
                >
                  <span className="block animate-dvd-y">
                    <DvdLogo />
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <NameHistory name={profile.name} aliases={aliases} />

            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] text-ink/70">
              <span>{profile.handle}</span>
              <span className="text-muted/60">·</span>
              <span>{profile.location}</span>
            </p>

            <p className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-ink/80">
              {profile.tagline}
            </p>

            <p className="mt-2 text-[14px] leading-relaxed text-ink/60">
              Currently: {profile.currentFocus}
            </p>
          </div>
        </div>

        {/* Level + service badge, mirroring Steam's right-hand header block */}
        <div className="lg:pl-2">
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-light leading-none text-ink/90">Level</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-accent text-[16px] font-light text-ink">
              {level}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 bg-base/45 p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-accent/40 bg-base/70 text-[18px] font-light text-accent">
              {level}
            </span>
            <div className="min-w-0">
              <p className="text-[14px] leading-tight text-ink/90">Years of Service</p>
              <p className="text-[13px] leading-tight text-muted">
                {progress}% to {level + 1} · since {sinceYear}
              </p>
            </div>
          </div>

          <div className="mt-3 h-[3px] overflow-hidden bg-base/60">
            <div className="h-full bg-xp-fill" style={{ width: `${progress}%` }} />
          </div>

          {stats && (
            <a
              href={stats.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="steam-button mt-4"
            >
              View on GitHub
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
