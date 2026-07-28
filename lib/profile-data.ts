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

export interface Project {
  id: string;
  name: string;
  /**
   * What kind of thing this is. The showcase is a catalog of everything
   * Bradley has built, not just repos, so entries with no GitHub presence
   * (research, design work) are first-class here.
   */
  kind: "Software" | "Research" | "Design";
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
  /**
   * "owner/name" of the backing GitHub repo, when there is one. Used to attach
   * live commit counts and language in the showcase. Explicit rather than
   * matched on `id`, because repo names and project names diverge — CodeArena
   * lives in `codearenamvp`.
   */
  ghRepo?: string;
  /** e.g. "2026 — present". Free text. */
  period: string;
}

/** One role in the Experience panel. */
export interface Role {
  org: string;
  title: string;
  /** "May 2026" — free text, shown as given. */
  start: string;
  /** Omit for a role you're still in; renders as "Present". */
  end?: string;
  location?: string;
  blurb?: string;
  url?: string;
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
  /** His actual LinkedIn headline, not a paraphrase of it. */
  tagline: "Applied Math + CS @ UC Berkeley. Building CodeArena.",
  location: "San Jose, California",
  /** Drives the level card — level = full years since this date. */
  codingSince: "2019-09-01",
  /** What you're actually working on right now. Shown in the header. */
  currentFocus: "CodeArena — evidence-first technical interviews",
  /** Shown beside the name. */
  pronouns: "he/him",
  /** Fallback avatar initials, used before/if the GitHub avatar resolves. */
  initials: "BT",
  /** Canonical contact address — drives both the Message button and Links. */
  email: "bradley_tsou@berkeley.edu",
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
export const aliases: string[] = ["brad945", "bradoom", "bradleytsou", "bt"];

/**
 * Experience in the order Bradley wants it shown — roughly newest first, but
 * arranged by hand, not sorted by date. Hand-maintained overall: LinkedIn has
 * no public API, so there's nothing to fetch and nothing that self-corrects.
 *
 * Transcribed from Bradley's LinkedIn verbatim; don't embellish it.
 */
export const roles: Role[] = [
  {
    org: "MedImpact Healthcare Systems",
    title: "Applied AI & Software Engineer Intern",
    start: "May 2026",
    location: "San Diego, CA",
    blurb: "Portal cybersecurity systems; Verdegard IT operations.",
  },
  {
    org: "Crossing Hurdles",
    title: "Language and Audio Engineer",
    start: "Jun 2026",
    blurb:
      "Producing training data for generative-music frontier AI labs including Spotify Labs, xAI and Mercor.",
  },
  {
    org: "CodeArena",
    title: "Founding Engineer",
    start: "Jan 2026",
    location: "San Francisco, CA",
    blurb: "Forward-deployed and software engineering.",
    url: "https://codearena.co/",
  },
  {
    org: "Web Development at Berkeley",
    title: "Industry Developer",
    start: "Jan 2026",
    blurb: "Building websites and fullstack apps.",
  },
  {
    org: "UC Santa Barbara",
    title: "Behavioral Economics Researcher Intern",
    start: "Jun 2024",
    end: "Aug 2025",
    blurb:
      "Devised utility functions and conducted market research to model human cognition and economic theories for waste-reduction strategies at UCSB's dining halls.",
  },
  {
    org: "The Bay Club Company",
    title: "Lifeguard",
    start: "Jun 2021",
    end: "Oct 2023",
    location: "Redwood City, CA",
    blurb:
      "40+ hours per week. Red Cross certified 2021-2025; first-responder training.",
  },
  {
    org: "BRI Youth",
    title: "Web UI Developer & Lead Tutor",
    start: "Mar 2020",
    end: "Dec 2024",
    blurb:
      "Prototyped website UI/UX for local startups and online services. Tutored mathematics (pre-algebra through Calculus II), violin and piano — 3x Tutor of the Month, 175+ hours logged, with recitals at senior homes and public libraries.",
  },
];

/**
 * The repos Recent Activity actually features, in order, as "owner/name".
 *
 * Replaces the automatic "most recently pushed public repo" list, which
 * surfaced years-old intro projects while missing the real work — most of that
 * lives in private repos or in repos Bradley is a collaborator on rather than
 * owner of, and neither shows up in the public API.
 *
 * Naming a private repo here DOES publish its name. That's the deliberate
 * exception to `namedPrivateRepos` below: these are hand-picked. Don't add
 * coursework repos.
 */
/**
 * The repo the "Favorite Project" panel features. Its `id` in `projects`
 * below must match the repo name, lowercased.
 */
export const FAVORITE_REPO = "ronoktanvir/Orca";

export const featuredRepos: string[] = [
  "sennaicodes/codearenamvp",
  "brad945/visionotes",
  "ronoktanvir/Orca",
];

/** This site's own repo. Used by the header ⋯ menu and the showcase entry. */
export const SITE_REPO_NAME = "bradleytsou-site";
export const siteRepoUrl = `https://github.com/${githubUsername}/${SITE_REPO_NAME}`;

/**
 * LinkedIn follower count.
 *
 * Hand-entered, and it's the only number on the page that can't self-correct:
 * LinkedIn has no public API, so nothing refreshes this. It WILL drift.
 * TODO(bradley): re-check it when you remember to.
 */
export const linkedinFollowers = 1457;

export const socials: SocialLink[] = [
  // Resolves off `githubUsername` above.
  { label: "GitHub", href: `https://github.com/${githubUsername}` },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bradleytsou" },
  { label: "Email", href: `mailto:${profile.email}` },
];

/**
 * Ordered by rarity, highest first — the showcase renders them in array order.
 *
 * Every `blurb` here is the repo's own GitHub description, copied verbatim, so
 * it can be checked. The placeholders that used to live here ("Project Three"
 * etc.) are gone.
 *
 * TODO(bradley): `period` is the year of last activity, not a real start date —
 * I don't have those. And the `tags` marked below are inferred from the
 * description or the repo's primary language rather than known; correct them.
 */
export const projects: Project[] = [
  {
    id: "codearena",
    ghRepo: "sennaicodes/codearenamvp",
    name: "CodeArena",
    kind: "Software",
    blurb:
      "Evidence-first technical interviews for AI-era hiring, with executable tasks, AI Critique, scorecards, replay, and live validation.",
    rarity: "core",
    tags: ["Next.js", "TypeScript", "Postgres", "Docker"], // TODO(bradley): verify — GitHub reports HTML as the primary language
    href: "https://codearena.co/",
    repo: undefined, // private
    period: "2026",
  },
  {
    id: "visionotes",
    ghRepo: "brad945/visionotes",
    name: "VisionNotes",
    kind: "Software",
    blurb: "Piano posture analyzer.",
    rarity: "major",
    tags: ["JavaScript", "Computer Vision"], // TODO(bradley): "Computer Vision" is inferred from the name
    href: undefined,
    repo: undefined, // private
    period: "2026",
  },
  {
    id: "guardian",
    ghRepo: "aryan-gupta123/Guardian",
    name: "Guardian",
    kind: "Software",
    blurb:
      "AI risk-defence agent that protects elderly users from financial scams — detects suspicious transactions and explains the risk in plain language. Built the entire frontend around accessibility for senior users: large type, guided voice, calm interface. 1st place at Cal Hacks 12.0 on the Bright Data track, out of 700 projects and 3,000+ participants.",
    rarity: "major",
    tags: ["Bright Data", "Fetch AI", "Fish Audio", "Claude"],
    href: undefined,
    repo: "https://github.com/aryan-gupta123/Guardian",
    period: "2025",
  },
  {
    id: "orca",
    ghRepo: "ronoktanvir/Orca",
    name: "Orca",
    kind: "Software",
    blurb: "Hierarchical RL system that orchestrates multi-agent teams.",
    rarity: "side",
    tags: ["Python", "Reinforcement Learning", "Multi-agent"],
    href: undefined,
    repo: "https://github.com/ronoktanvir/Orca",
    period: "2026",
  },
  {
    id: "ucsb-behavioral",
    name: "Dining hall waste study",
    kind: "Research",
    blurb:
      "Utility functions and market research modelling human cognition against waste-reduction strategies in UC Santa Barbara's dining halls.",
    rarity: "side",
    tags: ["Behavioral Economics", "Modelling"],
    period: "2024 — 2025",
  },
  {
    id: "bri-client-sites",
    name: "BRI Youth client sites",
    kind: "Design",
    blurb:
      "Website UI/UX prototyped and shipped for local startups and online services.",
    rarity: "side",
    tags: ["UI/UX", "Frontend"],
    period: "2023 — 2024",
  },
  {
    id: "site",
    name: "bradleytsou.com",
    kind: "Software",
    blurb:
      "This site. Steam-profile structure, but every stat on it is a real number.",
    rarity: "side",
    tags: ["Next.js", "Tailwind", "GitHub API"],
    href: undefined,
    // Private for now, so linking it would 404. Set to `siteRepoUrl` once public.
    repo: undefined,
    period: "2026",
  },
];

/** Human labels per tier. Kept for ordering; no longer rendered as a legend. */
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
  const words = name
    .replace(/[^A-Za-z0-9 .\-_]/g, "")
    .split(/[ .\-_]+/)
    .filter(Boolean);

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
