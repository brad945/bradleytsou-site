/**
 * Everything editable about the site lives here.
 *
 * `githubUsername` is real and the live data layer is on; the empty states
 * below only appear if it's ever unset.
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
  /**
   * What the work involved. Folded in from the standalone project entries that
   * used to sit alongside these — an entry should carry everything known about
   * it, not have half its detail in a second list.
   */
  tags?: string[];
  /**
   * "owner/name" when the role has a backing repo. Lets a merged entry keep
   * the live commit count that used to come from a separate project row.
   */
  ghRepo?: string;
  url?: string;
}

/**
 * A line in the header bio. `linkText` is the substring of `text` to turn into
 * a link — the org name — so the sentence stays one editable string instead of
 * being pre-split into fragments.
 */
export interface BioLine {
  text: string;
  /** Full Tailwind class, never interpolated — the scanner reads this as text. */
  className?: string;
  linkText?: string;
  href?: string;
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

/**
 * The site's canonical origin — what canonical tags, og:url and the sitemap
 * advertise.
 *
 * **Must match whichever domain is set Primary in Vercel → Settings → Domains.**
 * It's `www` today; the apex 308-redirects to it. If that's ever flipped,
 * change this too or the canonical will point at a URL that redirects.
 *
 * Hardcoded on purpose. This was derived from Vercel's environment before, but
 * `VERCEL_PROJECT_PRODUCTION_URL` is the *.vercel.app address, so every page
 * advertised that as canonical and the real domain looked like a duplicate.
 */
export const siteOrigin = "https://www.bradleytsou.com";

/**
 * Temporary "Coming soon" cover. **Flip to `false` to bring the page back** —
 * that's the only edit needed, and nothing else in the repo was changed.
 *
 * While it's on, everything below the profile header is covered: `page.tsx`
 * caps that block's height and lays `BoardedUp` over it. The grid underneath
 * still renders in full, and no component in it knows this exists.
 *
 * **It's a visual cover, not a redaction** — deliberately. Every repo name,
 * commit count and role behind it is still in the page source, one View
 * Source away, and still fetched from GitHub on every revalidate. That is the
 * direct cost of leaving the sections untouched, which is what makes it a
 * one-line change to put back.
 *
 * An earlier pass did it the other way — sections not rendered, fetches
 * skipped, nav items dropped — which genuinely hid the data but rewrote five
 * files to do it. If the data ever needs to be actually unreachable rather
 * than unseen, that's the approach to go back to; it's in the history.
 */
export const privacyScreen = true;

export const profile = {
  name: "Bradley Tsou",
  /** Shown under the name, mono. */
  handle: "@bradleytsou",
  /** His actual LinkedIn headline, not a paraphrase of it. */
  tagline: "Applied Math + CS @ UC Berkeley",
  /** Org in `tagline` to link, and where to. See `BioLine`. */
  taglineLink: {
    linkText: "UC Berkeley",
    href: "https://www.berkeley.edu",
    className: "text-berkeley",
  },
  location: "San Jose, California",
  /**
   * Drives the Level circle — level = full years since this date. Set by
   * Bradley; the 2019 that was here before was a scaffold placeholder.
   */
  codingSince: "2021-01-01",
  /**
   * What you're actually working on right now, one line each, shown in the
   * header under the tagline. A list because Bradley holds more than one
   * current role — a single string would have forced them onto one line or
   * into a comma splice.
   */
  currentFocus: [
    {
      text: "AI and Software Engineer Intern @ MedImpact",
      className: "text-medimpact",
      linkText: "MedImpact",
      href: "https://www.medimpact.com",
    },
    /*
     * Class written out in full, never built by interpolation — Tailwind's
     * scanner reads these files as text and can't see a composed name.
     */
    {
      text: "Founding Engineer @ DevEval",
      className: "text-deveval",
      linkText: "DevEval",
      href: "https://deveval.com",
    },
  ],
  /** Shown beside the name. */
  pronouns: "he/him",
  /**
   * Unused. It backed the avatar when that was fetched from GitHub and could
   * fail to resolve; the avatar is now `public/avatar.jpg`, which either ships
   * or breaks the build. Kept because it's the obvious fallback if the avatar
   * ever goes back to being fetched.
   */
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
 * name. These are the ones Bradley wants shown. Set to `[]` and the dropdown
 * reads "No previous aliases" instead.
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
    tags: ["Applied AI", "Cybersecurity", "IT Operations"],
    title: "Applied AI & Software Engineer Intern",
    start: "May 2026",
    location: "San Diego, CA",
    blurb: "Portal cybersecurity systems; Verdegard IT operations.",
  },
  {
    org: "DevEval",
    tags: ["Next.js", "TypeScript", "Postgres", "Docker", "Forward-Deployed"],
    ghRepo: "sennaicodes/codearenamvp",
    title: "Founding Engineer",
    start: "Jan 2026",
    location: "San Francisco, CA",
    blurb:
      "Evidence-first technical interviews for AI-era hiring — executable tasks, AI critique, scorecards, replay and live validation. Forward-deployed on customer implementations alongside core product engineering.",
    url: "https://deveval.com",
  },
  {
    org: "Crossing Hurdles",
    tags: ["Vocal Synthesis", "Data Annotation", "Audio Engineering"],
    title: "Language and Audio Engineer",
    start: "Jun 2026",
    blurb:
      "Producing training data for generative-music frontier AI labs including Spotify Labs, xAI and Mercor.",
  },
  {
    org: "Web Development at Berkeley",
    tags: ["Fullstack", "Web"],
    title: "Industry Developer",
    start: "Jan 2026",
    blurb: "Building websites and fullstack apps.",
  },
  {
    org: "UCSB",
    tags: ["Behavioral Economics", "Modelling", "Qualitative Research"],
    title: "Research Experience Intern",
    start: "Jun 2024",
    end: "Aug 2025",
    blurb:
      "Dining hall waste study: devised utility functions and conducted market research to model human cognition and economic theories against waste-reduction strategies at UCSB's dining halls.",
  },
  {
    org: "BRI Youth",
    tags: ["UI/UX", "Frontend", "Tutoring", "Music"],
    title: "Web UI Developer & Lead Tutor",
    start: "Mar 2020",
    end: "Dec 2024",
    blurb:
      "Prototyped and shipped website UI/UX for local startups and online services. Tutored mathematics (pre-algebra through Calculus II), violin and piano — 3x Tutor of the Month, 175+ hours logged, with recitals at senior homes and public libraries.",
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
 * The repo the "Favorite Project" panel features. Still `codearenamvp` — the
 * product renamed to DevEval but the repo did not, and this is an API
 * identifier, not display text. Renaming it breaks the live commit count.
 */
/**
 * The repo the "Favorite Project" panel features. Its `id` in `projects`
 * below must match the repo name, lowercased.
 */
export const FAVORITE_REPO = "sennaicodes/codearenamvp";

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
 *
 * Annotated `: number` for the same reason `githubUsername` is annotated
 * `: string` — otherwise TypeScript infers the literal type `1457`, and the
 * singular/plural check in Sidebar becomes a "no overlap" build error now that
 * this is the only reach value left.
 */
export const linkedinFollowers: number = 1457;

export const socials: SocialLink[] = [
  /*
   * Devpost replaced GitHub here at Bradley's request. GitHub isn't lost —
   * every repo name on the page links there, and "Follow on GitHub" is in the
   * header's ⋯ menu — so this slot was the one place it was redundant.
   *
   * Bare profile URL: the link he supplied carried `ref_content` /
   * `ref_feature` / `ref_medium` params, which are Devpost's own global-nav
   * referral tracking picked up by copying from a signed-in page. They say
   * where *he* clicked from, and would follow every visitor who used this link.
   */
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bradleytsou" },
  { label: "Devpost", href: "https://devpost.com/bradley_tsou" },
  { label: "Email", href: `mailto:${profile.email}` },
];

/**
 * Ordered by rarity, highest first — the showcase renders them in array order.
 *
 * Every `blurb` here is the repo's own GitHub description, copied verbatim, so
 * it can be checked. The placeholders that used to live here ("Project Three"
 * etc.) are gone.
 *
 * `period` is the year Bradley actually worked on each one — confirmed by him,
 * not derived from repo activity. The inferred tags have been confirmed too.
 */
export const projects: Project[] = [
  {
    id: "visionotes",
    ghRepo: "brad945/visionotes",
    name: "VisionNotes",
    kind: "Software",
    /*
     * From Bradley directly, not the repo description — that reads "Piano
     * posture analyzer.", which undersells it: it corrects in real time
     * rather than reporting after the fact. The only blurb on the page not
     * copied verbatim from GitHub; update the repo description and this can
     * go back to matching it.
     */
    blurb: "Real-time piano posture corrector.",
    rarity: "major",
    // "Computer Vision" confirmed by Bradley — it was inferred before.
    tags: ["JavaScript", "Computer Vision", "Real-time"],
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
 * repo capsule. Prefers word initials, then internal capitals ("DevEval" →
 * "DE"), then the first two letters.
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

/**
 * The number in the Level circle. Set by hand.
 *
 * On Steam, Level and Years of Service are genuinely two different stats —
 * level comes from badge XP, not from how long the account has existed — so
 * this being its own number is truer to the reference than reusing the years
 * was. But note what it costs: unlike everything else on the page, nothing
 * derives or checks this. See the note in CLAUDE.md.
 */
export const profileLevel = 20;

/**
 * Years of Experience — full years since `codingSince`. Drives that card
 * and picks its badge art.
 *
 * It used to also return a percentage through the current year and the start
 * year, for a "57% to 6 · since 2021" line under that card. That line is
 * gone: a percentage toward the next birthday of a date is the decorative
 * progress framing the rest of the page had already dropped.
 */
export function experience(now: Date = new Date()) {
  const start = new Date(profile.codingSince);
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, now.getTime() - start.getTime()) / msPerYear;
  return { years: Math.floor(elapsed) };
}
