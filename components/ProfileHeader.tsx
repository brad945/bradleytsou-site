import Image from "next/image";
import NameHistory from "@/components/NameHistory";
import type { GitHubStats } from "@/lib/github";
import { aliases, experience, profile } from "@/lib/profile-data";

interface ProfileHeaderProps {
  stats: GitHubStats | null;
}

export default function ProfileHeader({ stats }: ProfileHeaderProps) {
  const { level, progress, sinceYear } = experience();
  const avatar = stats?.avatarUrl ?? null;

  return (
    <header className="relative overflow-hidden bg-profile-hero">
      {/* Darkens the left half so the name always has contrast over the art. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/70 via-base/20 to-transparent"
        aria-hidden
      />

      <div className="relative grid gap-6 p-5 lg:grid-cols-[2fr_1fr]">
        {/* Identity */}
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="shrink-0">
            {/* Animated frame, replicating Steam's. Built from palette
                gradients, not lifted artwork. w-fit keeps it square when the
                header stacks on mobile. */}
            <div className="w-fit rounded-[2px] bg-avatar-frame p-[5px] shadow-[0_0_18px_-4px_theme(colors.accent)] animate-frame-tint">
              <div className="relative h-[150px] w-[150px] overflow-hidden bg-base">
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
                  baked into the keyframes against this 150px box — resize one
                  and you must resize the other.
                */}
                <span className="pointer-events-none absolute left-0 top-0 animate-dvd-x" aria-hidden>
                  <span className="block animate-dvd-y">
                    <span className="flex h-[20px] w-[42px] items-center justify-center border bg-base/70 text-[11px] font-semibold tracking-[0.12em] animate-dvd-tint">
                      {profile.initials}
                    </span>
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
