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
 *
 * Flat fill, nothing else: no gradient, no glow, and only a trace of shadow so
 * it stays legible over a light avatar. Everything paints with `currentColor`,
 * so the `dvd-tint` animation is the single thing that changes its colour.
 */
function DvdLogo() {
  return (
    <svg
      width="63"
      height="36"
      viewBox="0 0 110 62"
      fill="none"
      className="block animate-dvd-tint drop-shadow-[0_1px_1px_rgba(0,0,0,0.075)]"
      aria-hidden
    >
      {/*
        The glyphs are drawn as paths, not set in a font. The mark's letterforms
        are squat and slab-heavy with tight counters — no font-weight on a
        webfont gets close, which is why earlier passes using <text> at 900
        still read wrong however much they were nudged.

        Each D is one evenodd path: outer shell then counter. skewX(-14) is the
        italic slant; it shifts lower points left, so the group is translated
        right to keep the mark inside the viewBox.
      */}
      <g transform="skewX(-14) translate(16 3)" fill="currentColor" fillRule="evenodd">
        <path d="M0 0 H15 C24 0 28 6.5 28 16 C28 25.5 24 32 15 32 H0 Z M8.5 8 H14 C18 8 19.5 11 19.5 16 C19.5 21 18 24 14 24 H8.5 Z" />
        <path transform="translate(29 0)" d="M0 0 H9.5 L13 19 L16.5 0 H26 L18 32 H8 Z" />
        <path
          transform="translate(56 0)"
          d="M0 0 H15 C24 0 28 6.5 28 16 C28 25.5 24 32 15 32 H0 Z M8.5 8 H14 C18 8 19.5 11 19.5 16 C19.5 21 18 24 14 24 H8.5 Z"
        />
      </g>

      {/*
        A thick ring, not a hairline — at small sizes the open centre plus the
        VIDEO lettering is what reads as the disc. The wordmark overlaps its
        top edge.
      */}
      <ellipse cx="52" cy="43" rx="41" ry="8.5" stroke="currentColor" strokeWidth="6.5" />
      <text
        x="52"
        y="46.4"
        textAnchor="middle"
        fill="currentColor"
        fontSize="9.5"
        fontWeight="800"
        fontFamily="var(--font-sans), sans-serif"
        letterSpacing="0.4"
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
            {/*
              Measured off the reference: side bands are 10.6% of the photo's
              width, top/bottom 6.1% of its height (76px and 43.5px against a
              720x717 photo) — a 1.75 ratio. On this 150px avatar that's
              a 16 / 9 total band. The 1px bevel border counts toward that, so
              the padding is 15 / 8. Bigger and it stops reading as a frame.

              The band is not flat: it's a raised bevel. Light on the top and
              left edges, dark on the bottom and right, with the photo sitting
              in a sunken well (the reverse) below it.
            */}
            <div className="w-fit border border-b-frameLo border-l-frameHi border-r-frameLo border-t-frameHi bg-avatar-frame px-[15px] py-[8px]">
              <div className="relative h-[150px] w-[150px] overflow-hidden border border-b-frameHi border-l-frameLo border-r-frameHi border-t-frameLo bg-base">
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
                  baked into the keyframes against this box's 148px padding
                  area and the 63x36 logo — resize one and you must resize the
                  other, and the travel has to stay divisible by the step count
                  or the logo jitters. See the keyframes for why.
                */}
                {/* will-change promotes each axis to its own layer, so a step
                    composites rather than repainting the SVG. */}
                <span
                  className="pointer-events-none absolute left-0 top-0 animate-dvd-x will-change-transform"
                  aria-hidden
                >
                  <span className="block animate-dvd-y will-change-transform">
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
