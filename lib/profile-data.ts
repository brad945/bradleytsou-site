/**
 * Everything editable about the site lives here.
 *
 * TODO(bradley): replace `githubUsername` and the project links below with the
 * real ones. The activity feed, the repo rows, the sidebar counts and the
 * avatar are all driven off `githubUsername` — until it's real, the feed
 * renders its empty state and the data-backed sidebar panels hide themselves
 * rather than crashing.
 */

export type Rarity = "core" | "major" | "side";

export interface Badge {
  /** Short name shown on the badge chip. */
  name: string;
  /** What the badge is actually for — hover title. Must map to a real milestone. */
  description: string;
  /** ISO date the milestone happened. */
  earned: string;
  /** Single glyph. Kept as text so there are no image deps. */
  glyph: string;
}

export interface Project {
  id: string;
  name: string;
  /** One line. What it is, not how impressive it is. */
  blurb: string;
  /** How central this is to Bradley's work — drives the left-border colour. */
  rarity: Rarity;
  /** Stack / role tags, shown as mono chips. */
  tags: string[];
  /** Live site or demo. Omit if there isn't one. */
  href?: string;
  /** Source. Omit if private. */
  repo?: string;
  /** e.g. "2026 — present". Free text. */
  period: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

/** Sentinel meaning "Bradley hasn't filled this in yet." */
export const PLACEHOLDER_GITHUB_USERNAME = "your-github-username";

/**
 * GitHub handle the whole live-data layer keys off.
 *
 * Annotated `: string` on purpose — without it TypeScript infers the literal
 * type and every `githubUsername === PLACEHOLDER_GITHUB_USERNAME` check
 * becomes a "these types have no overlap" build error the moment this is
 * edited. Keep the annotation.
 */
export const githubUsername: string = "brad945";

export const profile = {
  name: "Bradley Tsou",
  /** Shown under the name, mono. */
  handle: "@bradleytsou",
  /** One sentence. Real, not a mission statement. */
  tagline: "CS student building CodeArena. Mostly backend, systems, and dev tooling.",
  location: "United States", // TODO(bradley): city if you want it public
  /** Drives the level card — level = full years since this date. */
  codingSince: "2019-09-01",
  /** What you're actually working on right now. Shown in the header. */
  currentFocus: "CodeArena — competitive programming platform",
  /** Fallback avatar initials, used before/if the GitHub avatar resolves. */
  initials: "BT",
  status: {
    label: "Online",
    /** Sub-label under the status dot, Steam-style. */
    detail: "Currently shipping",
  },
};

/**
 * Steam lists every persona name you've used, behind the caret next to the
 * name. TODO(bradley): replace with your real previous handles, or set this
 * to `[]` and the dropdown says "No previous aliases".
 */
export const aliases: string[] = [
  "brad945",
  "bradoom",
  "bradleytsou",
  "bt",
];

export const socials: SocialLink[] = [
  // Resolves off `githubUsername` above.
  { label: "GitHub", href: `https://github.com/${githubUsername}` },
  { label: "LinkedIn", href: "https://linkedin.com/in/your-linkedin" }, // TODO(bradley)
  { label: "Email", href: "mailto:bradoomm8@gmail.com" },
];

/**
 * TODO(bradley): every badge below should map to something that actually
 * happened. Delete the ones that don't.
 */
export const badges: Badge[] = [
  {
    name: "First Commit",
    description: "First line of code pushed to a public repo",
    earned: "2019-09-01",
    glyph: "◆",
  },
  {
    name: "Shipped",
    description: "First project deployed and used by someone other than me",
    earned: "2023-06-01",
    glyph: "▲",
  },
  {
    name: "Founder",
    description: "Started CodeArena",
    earned: "2025-01-01",
    glyph: "★",
  },
  {
    name: "Open Source",
    description: "First pull request merged into someone else's project",
    earned: "2024-03-01",
    glyph: "⟡",
  },
];

/**
 * Ordered by rarity, highest first — the showcase renders them in array order.
 * TODO(bradley): swap these for the real thing. Placeholder copy is marked.
 */
export const projects: Project[] = [
  {
    id: "codearena",
    name: "CodeArena",
    blurb: "Competitive programming platform — matchmaking, live judging, ranked ladders.",
    rarity: "core",
    tags: ["Next.js", "TypeScript", "Postgres", "Docker"],
    href: undefined, // TODO(bradley): live URL
    repo: undefined, // TODO(bradley): repo URL if public
    period: "2025 — present",
  },
  {
    id: "site",
    name: "bradleytsou.com",
    blurb: "This site. Steam-profile structure, but every stat on it is a real number.",
    rarity: "major",
    tags: ["Next.js", "Tailwind", "GitHub API"],
    href: undefined,
    // Resolves off `githubUsername` above — becomes a real link once that's set.
    repo: `https://github.com/${githubUsername}/bradleytsou-site`,
    period: "2026",
  },
  {
    id: "placeholder-1",
    name: "Project Three", // TODO(bradley): rename
    blurb: "Placeholder — replace with a real project.",
    rarity: "major",
    tags: ["TODO"],
    period: "2025",
  },
  {
    id: "placeholder-2",
    name: "Project Four", // TODO(bradley): rename
    blurb: "Placeholder — replace with a real project.",
    rarity: "side",
    tags: ["TODO"],
    period: "2024",
  },
  {
    id: "placeholder-3",
    name: "Project Five", // TODO(bradley): rename
    blurb: "Placeholder — replace with a real project.",
    rarity: "side",
    tags: ["TODO"],
    period: "2024",
  },
];

/** Human labels for each rarity tier, shown in the showcase legend. */
export const rarityLabels: Record<Rarity, string> = {
  core: "Core",
  major: "Major",
  side: "Side",
};

/**
 * Static Tailwind class strings per tier. Written out in full — Tailwind's
 * scanner can't see class names built by string concatenation.
 */
export const rarityStyles: Record<
  Rarity,
  {
    /** Left accent bar, for wide cards. */
    border: string;
    /** Full 1px outline, for the square inventory tiles. */
    tileBorder: string;
    text: string;
    dot: string;
    tint: string;
  }
> = {
  core: {
    border: "border-l-rarity-core",
    tileBorder: "border-rarity-core/70",
    text: "text-rarity-core",
    dot: "bg-rarity-core",
    tint: "hover:bg-rarity-core/[0.10]",
  },
  major: {
    border: "border-l-rarity-major",
    tileBorder: "border-rarity-major/70",
    text: "text-rarity-major",
    dot: "bg-rarity-major",
    tint: "hover:bg-rarity-major/[0.12]",
  },
  side: {
    border: "border-l-rarity-side",
    tileBorder: "border-rarity-side/60",
    text: "text-rarity-side",
    dot: "bg-rarity-side",
    tint: "hover:bg-rarity-side/[0.10]",
  },
};

/**
 * One- or two-character stand-in for item art, used on every square tile and
 * repo capsule. Prefers word initials, then internal capitals ("CodeArena" →
 * "CA"), then the first two letters.
 */
export function monogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 .\-_]/g, "").split(/[ .\-_]+/).filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  const word = words[0] ?? "";
  const capitals = word.match(/[A-Z0-9]/g);
  if (capitals && capitals.length >= 2) return capitals.slice(0, 2).join("");
  return word.slice(0, 2).toUpperCase();
}

/** Level = full years since `codingSince`; XP = progress through the current year. */
export function experience(now: Date = new Date()) {
  const start = new Date(profile.codingSince);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, now.getTime() - start.getTime()) / msPerYear;
  const level = Math.floor(elapsed);
  const progress = Math.round((elapsed - level) * 100);
  return { level, progress, sinceYear: start.getFullYear() };
}
