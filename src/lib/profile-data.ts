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
  /**
   * How central this is to Bradley's work.
   *
   * **Nothing renders this today.** It drove the Item Showcase's tier colours,
   * and that panel is gone. Kept because it's Bradley's own judgement about
   * his work rather than a styling detail, and it's the input the planned
   * skills map would want — but note that it can't be seen, so it can't be
   * checked.
   */
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
  /**
   * Render this role *below* the project rows instead of with the other roles.
   *
   * The Experience panel is one merged list, but it's built as roles-then-
   * projects, which tied a role's position to its category. BRI Youth is the
   * oldest thing here and Bradley wants it last overall, which that structure
   * couldn't express — it could only ever be last among the roles.
   */
  afterProjects?: boolean;
  /**
   * Keep the role in the file but off the page.
   *
   * A flag rather than deleting it, because "hide this for now" and "this
   * never happened" are different things — the entry stays reviewable and
   * comes back by flipping one word.
   *
   * **Its tags stay on the Tech Stack**, deliberately, at Bradley's call.
   * Hiding the row hides where he did the work, not that he can do it — the
   * skill didn't stop being real. The cost is that those tags are the one
   * part of that panel a reader can't trace to anything visible, so treat
   * this flag as a small exception to its guarantee rather than a free one.
   */
  hidden?: boolean;
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
  /** Key into `SOCIAL_ICONS` in components/SocialIcons.tsx. */
  icon: string;
  /**
   * Omit for a platform Bradley hasn't given a profile for yet. The icon still
   * renders — greyed and not a link — so the row shows the full set without
   * inventing a URL or sending anyone to a 404.
   */
  href?: string;
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
 * The "Coming soon" cover. **Flip to `false` to bring the page back** — that's
 * the only edit; nothing else is changed to accommodate it.
 *
 * While it's on, `page.tsx` renders `BoardedUp` **instead of** the profile
 * grid, and `ProfileHeader` drops the Message / More row. A visitor gets the
 * nav, the profile header, and a "Coming soon" panel.
 *
 * It was an overlay over the grid first, and that could not hold. The cover
 * sat inside the clipped wrapper, so an anchor jump from the nav scrolled the
 * container and carried the cover off with it; every link underneath stayed in
 * the tab order regardless of what was painted on top; and the whole lot sat
 * in the page source. **Covering pixels doesn't disable a document.**
 *
 * `/play` is deliberately *not* covered: it holds nothing but one line, so
 * there's nothing there to hide.
 */
export const privacyScreen = false;

/**
 * The balance shown under the login in the nav, where Steam puts an account
 * balance.
 *
 * **This is the one figure on the page that isn't fetched.** There's no
 * account behind this site to have a balance, so it's Steam's chrome
 * reproduced rather than data — a prop, deliberately, at Bradley's request.
 * Kept here rather than inline in `SiteNav` so it can't be mistaken for
 * something that was meant to be wired up and never was.
 */
export const accountBalance = "$0.21";

/**
 * Steam profile, or a friend-invite link.
 *
 * **The plain profile, deliberately.** A friend-invite link
 * (`https://s.team/p/xxxx-xxxxx`) adds you in one click rather than two, but
 * Steam expires them after 30 days — it would rot into a dead link on a page
 * nobody edits weekly, which is worse than the extra step. The vanity URL
 * doesn't expire.
 *
 * Read by the ⋯ menu's "Add friend on Steam" row and by the Steam icon in the
 * sidebar's Links row; both are omitted entirely when this is null.
 */
export const steamProfileUrl: string | null =
  "https://steamcommunity.com/id/bushhammer";

/**
 * LinkedIn profile.
 *
 * Its own export rather than living only inside `socials`, because two places
 * need it now — the sidebar's Links row and the header's ⋯ menu — and digging
 * it back out of that array by label would break silently the moment the label
 * were reworded.
 */
export const linkedinUrl: string | null =
  "https://www.linkedin.com/in/bradleytsou";

export interface Book {
  title: string;
  author: string;
  /**
   * Where it is for him, not a rating.
   *
   * "reading" is the one that makes the shelf worth having — it's the only
   * status that changes, and the only one that says anything about now.
   */
  status: "reading" | "read" | "shelved";
  /** One line. Why it's here, not what it's about — a summary is a blurb. */
  note?: string;
  /**
   * A shorter title for the spine. Falls back to `title`.
   *
   * Real spines abbreviate — a paperback doesn't print "The Little Book of
   * Common Sense Investing" down 20mm of card either. Without this the long
   * ones either overflowed their spine or shrank to unreadable type, and the
   * full title is still right there in the detail view when you click.
   */
  spineLabel?: string;
  /**
   * Cover art, cached into `public/books/` from Open Library's cover API.
   *
   * **Cached rather than hotlinked.** Covers never change, and fetching them
   * per render would make the shelf depend on openlibrary.org being up to
   * look right. 260px tall, which is more than the detail view uses.
   */
  cover: string;
  /**
   * Spine fill and the text colour that reads on it.
   *
   * **Sampled from the real cover, not chosen.** These are the only hex values
   * outside the Tailwind config, and the exception is the point: they're data
   * about a physical object, the same way `avatar.jpg` is, rather than a
   * design decision. Picking them from the palette would have made the shelf
   * look like the site instead of like the books.
   *
   * `ink` is derived from the fill's relative luminance — several of these
   * covers are near-white, and a cycled text colour would have been invisible
   * on them.
   */
  spine: string;
  ink: string;
}

/**
 * The bookshelf.
 *
 * **Hand-kept, and it has to be.** Books are the one source on this page with
 * no API worth using — Goodreads killed theirs in 2020 and nothing replaced
 * it — so this is a written list, and the Recent Activity block says "kept by
 * hand" beside it for that reason. It sits between two live feeds and would
 * otherwise borrow their credibility.
 *
 * Titles, authors and covers were resolved through Open Library, so the
 * metadata is right even where the title given was approximate.
 */
export const books: Book[] = [
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    status: "read",
    note: "Read it before I knew what half of it meant.",
    cover: "/books/steve-jobs.jpg",
    spine: "#cccccc",
    ink: "#0e141c",
  },
  {
    title: "Stay True",
    author: "Hua Hsu",
    status: "read",
    note: "The one I hand to people.",
    cover: "/books/stay-true.jpg",
    spine: "#fc843c",
    ink: "#0e141c",
  },
  {
    title: "Sula",
    author: "Toni Morrison",
    status: "read",
    cover: "/books/sula.jpg",
    spine: "#6c543c",
    ink: "#ffffff",
  },
  {
    title: "Tuesdays with Morrie",
    author: "Mitch Albom",
    status: "read",
    cover: "/books/tuesdays-with-morrie.jpg",
    spine: "#ccb484",
    ink: "#0e141c",
  },
  {
    title: "Death of a Salesman",
    author: "Arthur Miller",
    status: "read",
    note: "Assigned. Stayed anyway.",
    cover: "/books/death-of-a-salesman.jpg",
    spine: "#e4e4cc",
    ink: "#0e141c",
  },
  {
    title: "The Little Book of Common Sense Investing",
    spineLabel: "Common Sense Investing",
    author: "John C. Bogle",
    status: "reading",
    note: "Bogle founded Vanguard, then spent a book arguing you should mostly do nothing.",
    cover: "/books/common-sense-investing.jpg",
    spine: "#840c0c",
    ink: "#ffffff",
  },
  {
    title: "The Authoritative Calvin and Hobbes",
    spineLabel: "Calvin and Hobbes",
    author: "Bill Watterson",
    status: "shelved",
    note: "Re-read more than anything else here.",
    cover: "/books/calvin-and-hobbes.jpg",
    spine: "#e4e4e4",
    ink: "#0e141c",
  },
  {
    title: "The Complete Peanuts, 1953–1954",
    spineLabel: "The Complete Peanuts",
    author: "Charles M. Schulz",
    status: "shelved",
    note: "The early Schulz, before the specials.",
    cover: "/books/peanuts.jpg",
    spine: "#0c549c",
    ink: "#ffffff",
  },
];
/**
 * Steam account id, and the game the "Favorite Game" panel features.
 *
 * The id is the 64-bit one, not the vanity name — every Steam API takes that
 * form, and the vanity URL is only an alias that can be changed.
 *
 * `appId` is Steam's own app id (730 is Counter-Strike 2), which is what the
 * playtime lookup keys on. `name`, `studio` and `released` are display text;
 * they could be fetched from the store API but that's a second call to say
 * something that never changes.
 *
 * **`blurb` is Bradley's, not a store description.** The point of the panel is
 * why *he* likes it, which no API knows.
 *
 * Valorant can't ever go here: it's Riot's, not on Steam, so there'd be no
 * hours to show and the panel would be a picture of a name.
 */
export const steamId64 = "76561198438468192";

export const favoriteGame = {
  appId: 730,
  name: "Counter-Strike 2",
  studio: "Valve",
  released: "2023",
  blurb: "Where the bhop mechanic planned for /play comes from.",
} as const;

/**
 * Hackathon wins, for the sidebar row.
 *
 * Hand-set, from Bradley directly.
 *
 * It replaced `projects.length` when the row was relabelled from "Projects".
 * That count is also 3, which makes this look like a no-op — it isn't. The old
 * number counted entries in the `projects` array and would move the moment a
 * fourth project was added, silently claiming a win that never happened. The
 * two figures agreeing today is a coincidence, not a link.
 *
 * Devpost is the source of truth, and it has no public API, so nothing here
 * can check this. It joins `profileLevel` and `accountBalance` on the short
 * list of values that can't self-correct — win a fourth and this stays 3 until
 * someone edits it.
 */
export const hackathonWins: number | null = 3;

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
      text: "Prev AI and SWE @ MedImpact",
      className: "text-medimpact",
      linkText: "MedImpact",
      href: "https://www.medimpact.com",
    },
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
export const aliases: string[] = [
  "brad945",
  "bradoom",
  "bradleytsou",
  "algebradley",
  "bt",
];

/**
 * Experience in the order Bradley wants it shown — roughly newest first, but
 * arranged by hand, not sorted by date. BRI Youth carries `afterProjects`, so
 * it renders below the project rows rather than with the other roles. Hand-maintained overall: LinkedIn has
 * no public API, so there's nothing to fetch and nothing that self-corrects.
 *
 * Transcribed from Bradley's LinkedIn verbatim; don't embellish it.
 */
export const roles: Role[] = [
  {
    org: "MedImpact Healthcare Systems",
    /*
     * "HIPAA / PHI" is a competency, not a tool, and it's here rather than in
     * `EVIDENCED_STACK` because it's true *of this role* — MedImpact is a
     * pharmacy-benefits company, so the sensitive-data work is the job, not a
     * side note. Tagging it on the role is what puts it in the Tech Stack
     * panel; the panel only ever shows things attached to real work.
     *
     * Named with both terms deliberately: "HIPAA" is what a recruiter filters
     * on, "PHI" is what an engineer recognises.
     */
    tags: ["Applied AI", "Cybersecurity", "HIPAA / PHI", "IT Operations"],
    title: "Applied AI & Software Engineer Intern",
    start: "May 2026",
    location: "San Diego, CA",
    blurb: "Portal cybersecurity systems; Verdegard IT operations.",
    url: "https://www.medimpact.com",
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
    org: "micro1",
    // Hidden at Bradley's request. Nothing else was changed; unset this to
    // bring it back, tags and all.
    hidden: true,
    tags: ["Vocal Synthesis", "Data Annotation", "Audio Engineering"],
    title: "Language and Audio Engineer",
    start: "Jun 2026",
    blurb:
      "Producing training data for generative-music frontier AI labs including Spotify Labs, xAI and Mercor.",
    url: "https://micro1.ai",
  },
  {
    org: "Web Development at Berkeley",
    tags: ["Fullstack", "Web"],
    title: "Industry Developer",
    start: "Jan 2026",
    blurb: "Building websites and fullstack apps.",
    url: "https://webatberkeley.org",
  },
  {
    org: "UCSB",
    tags: ["Behavioral Economics", "Modelling", "Qualitative Research"],
    title: "Research Experience Intern",
    start: "Jun 2024",
    end: "Aug 2025",
    blurb:
      "Dining hall waste study: devised utility functions and conducted market research to model human cognition and economic theories against waste-reduction strategies at UCSB's dining halls.",
    url: "https://www.ucsb.edu",
  },
  {
    org: "BRI Youth",
    afterProjects: true,
    tags: ["UI/UX", "Frontend", "Tutoring", "Music"],
    title: "Web UI Developer & Lead Tutor",
    start: "Mar 2020",
    end: "Dec 2024",
    blurb:
      "Prototyped and shipped website UI/UX for local startups and online services. Tutored mathematics (pre-algebra through Calculus II), violin and piano — 3x Tutor of the Month, 175+ hours logged, with recitals at senior homes and public libraries.",
  url: "https://briyouth.wixsite.com/briyouth",
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
export const featuredRepos: string[] = [
  /*
   * Order is manual and it is what Recent Activity shows — the panel takes the
   * first few in this order, it does not sort by push date.
   *
   * That's why `artie-queue` was missing rather than stale: the GitHub data was
   * fetching correctly the whole time, but a repo that isn't on this list can't
   * appear. This list exists precisely so the panel isn't "most recently
   * pushed" — that ordering surfaced years-old intro repos while missing both
   * private work and repos Bradley only contributes to. The cost is that new
   * work has to be added here by hand.
   */
  "brad945/artie-queue",
  "sennaicodes/codearenamvp",
  "brad945/visionotes",
  "ronoktanvir/Orca",
];

/**
 * Display names for repos whose GitHub name isn't what the thing is called.
 *
 * Keyed by `owner/name`, which stays the API identifier — renaming the repo
 * itself would break `FAVORITE_REPO`, the `ghRepo` lookups on roles and
 * projects, and every fetch. This only changes what a reader sees.
 */
export const repoDisplayNames: Record<string, string> = {
  // CodeArena was renamed DevEval in mid-2026; the repo kept the old name.
  "sennaicodes/codearenamvp": "DevEval",
};

/**
 * giscus, the GitHub-Discussions-backed comments.
 *
 * **Lives here rather than in `Comments.tsx` because that file is
 * `"use client"`, and a server component cannot read a property off a client
 * module** — `page.tsx` needs the repo and discussion number to fetch the
 * comment count for the sidebar. Next fails that at runtime, not at build, so
 * it's worth stating: this is the shared config, the component only consumes
 * it.
 *
 * `repoId` and `categoryId` are GitHub's GraphQL node ids, read off the API
 * rather than copied out of giscus.app. They're **not secret**: giscus is a
 * client-side script, so every visitor receives them. They only say which repo
 * and category to post into.
 *
 * The category is **Announcements**, and the type matters more than the name:
 * only maintainers can open discussions in an Announcement-format category, so
 * a stranger can't create one for giscus to adopt as this page's thread.
 *
 * `discussion` pins it by **number**, which does no search. Pathname mapping
 * makes giscus search GitHub by title, and that index lags creation by
 * minutes — giscus created the discussion and then couldn't find what it had
 * just made, so the box came up empty and commenting silently failed.
 */
export const giscus = {
  repoId: "R_kgDOTirmOQ",
  category: "Announcements",
  categoryId: "DIC_kwDOTirmOc4DDlm4",
  discussion: 1,
} as const;

/** This site's own repo. Used by the header ⋯ menu and the showcase entry. */
export const SITE_REPO_NAME = "bradleytsou-site";
export const siteRepoUrl = `https://github.com/${githubUsername}/${SITE_REPO_NAME}`;
/** "owner/name", the form giscus and the GraphQL API both want. */
export const siteRepoSlug = `${githubUsername}/${SITE_REPO_NAME}`;

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
  { label: "LinkedIn", icon: "linkedin", href: linkedinUrl ?? undefined },
  { label: "Devpost", icon: "devpost", href: "https://devpost.com/bradley_tsou" },
  { label: "Email", icon: "mail", href: `mailto:${profile.email}` },
  /*
   * Placeholders, at Bradley's request — icons only until he supplies the
   * profile URLs. Each renders greyed and unlinked rather than pointing
   * somewhere plausible, so the row can't send a visitor to a 404. Fill in
   * `href` and the entry lights up on its own; no other change needed.
   *
   * GitHub is here rather than in the note below because the row is now a set
   * of marks, where its absence would read as an omission — it was previously
   * left out as redundant when this was a list of words.
   */
  { label: "GitHub", icon: "github", href: `https://github.com/${githubUsername}` },
  { label: "Steam", icon: "steam", href: steamProfileUrl ?? undefined },
  { label: "Discord", icon: "discord" },
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
    /*
     * Sharpened from ["Reinforcement Learning", "Multi-agent"], which undersold
     * what the blurb right above already says: hierarchical RL orchestrating
     * agent teams is a specific thing, and the generic pair could describe any
     * paper. These tags feed the Tech Stack panel, so the panel gets the
     * sharper claim too.
     */
    tags: [
      "Python",
      "Hierarchical RL",
      "Multi-agent Orchestration",
      "Subagent Delegation",
    ],
    href: undefined,
    /*
     * No link: `ronoktanvir/Orca` 404s for anyone not on it — the API reports
     * it private. It carried the public URL and sent visitors to a dead page.
     * The row shows a Private tag instead; restore the URL if it's ever opened
     * up.
     */
    repo: undefined,
    period: "2026",
  },
];

/**
 * Tags that name a *job function or a non-technical field* rather than
 * something you'd put on a stack — excluded from the Tech Stack panel.
 *
 * The line is drawn at job functions ("Fullstack", "Forward-Deployed") and
 * non-technical domains ("Behavioral Economics", "Tutoring"). Techniques stay:
 * Computer Vision, Reinforcement Learning and Multi-agent were cut in the
 * first pass as "fields, not tools" and put back — for an AI engineer they're
 * as much a part of the stack as Postgres, and cutting them was the main
 * reason the panel came out thin.
 */
const NON_STACK_TAGS = new Set([
  // Job functions and ways of working, not tools
  "Forward-Deployed",
  "Fullstack",
  "Frontend",
  "Web",
  "Applied AI",
  "IT Operations",
  // Non-technical fields
  "Behavioral Economics",
  "Qualitative Research",
  "Modelling",
  "Tutoring",
  "Music",
  "Data Annotation",
  // A property of a system rather than a thing used to build one
  "Real-time",
]);

/**
 * Tools Bradley demonstrably works with that no `tags` entry happens to name.
 *
 * Every one is evidenced *inside this repo* rather than assumed from the shape
 * of his work — that's the bar, and it's why the list is short. React and
 * Tailwind are in `package.json`; Vercel is the documented deploy target;
 * GraphQL and the REST work are both in `src/lib/github.ts`, which calls the
 * v4 and v3 APIs respectively.
 *
 * **This is the one part of the panel not derived from data elsewhere on the
 * page, so it's the part that can be wrong.** If Bradley works with something
 * that isn't here — a cloud, a database, a framework from a private repo —
 * adding the string is the whole change. Don't guess entries in: a stack that
 * lists a tool he hasn't used is exactly the claim this site is built not to
 * make.
 */
const EVIDENCED_STACK = [
  "React",
  "Tailwind CSS",
  "Node.js",
  "Vercel",
  "GraphQL",
  "REST APIs",
  /*
   * These two are **Bradley's own statement, not evidenced in this repo** —
   * which is a weaker footing than everything above, so it's worth saying.
   * He works in Java (it's the Berkeley CS sequence) and with Codex
   * alongside Claude; neither leaves a trace here, so nothing on this page
   * can check them. That makes them the stack's equivalent of `profileLevel`.
   */
  "Java",
  "Codex",
];

/**
 * The Tech Stack panel's contents: every tool and technique named in `roles` or
 * `projects`, minus `NON_STACK_TAGS`, plus `EVIDENCED_STACK`.
 *
 * Mostly derived rather than written, so the bulk of it can't claim anything
 * that isn't attached to real work elsewhere on this page. Order is order of
 * appearance — `roles` is hand-ordered with recent work first — with the
 * evidenced entries last.
 *
 * Deliberately does *not* merge the fetched GitHub language breakdown: that
 * has its own panel directly below this one, and repeating it here would make
 * the stack look bigger without saying anything new.
 */
/**
 * The order the stack is read in, most-recognisable first.
 *
 * **Order of appearance was the wrong order.** The panel is derived from the
 * `tags` on roles and projects, so it came out in the sequence those happen to
 * be authored in — which put Cybersecurity first and Python sixteenth. Nobody
 * scanning a stack reads it that way; they look for the languages, then what
 * you build with, then the interesting part.
 *
 * Grouped rather than a flat list so the reasoning survives: each tier is a
 * kind of thing, and a new tag joins the tier it belongs to.
 *
 * **Anything not listed here still appears**, at the end, in the order it was
 * authored. That matters more than the ranking: a tag added to a role should
 * turn up on the page whether or not anyone remembered to rank it, rather than
 * silently vanishing.
 */
const STACK_ORDER: readonly (readonly string[])[] = [
  // Languages. What a reader looks for first, and what most filters key on.
  ["Python", "Java", "TypeScript", "JavaScript"],
  // What he builds with.
  ["Next.js", "React", "Node.js", "Tailwind CSS"],
  // The AI work, which is what the current roles actually are.
  [
    "Claude",
    "Codex",
    "Multi-agent Orchestration",
    "Subagent Delegation",
    "Hierarchical RL",
    "Computer Vision",
    "Fetch AI",
    "Fish Audio",
    "Bright Data",
  ],
  // Data and infrastructure.
  ["Postgres", "Docker", "Vercel", "GraphQL", "REST APIs"],
  // Domain competencies — real, but not what anyone scans a stack for.
  [
    "Cybersecurity",
    "HIPAA / PHI",
    "Vocal Synthesis",
    "Audio Engineering",
    "UI/UX",
  ],
];

/** tag -> sort key. Unranked tags sort after every ranked one. */
const STACK_RANK = new Map<string, number>();
STACK_ORDER.forEach((tier, t) =>
  tier.forEach((tag, i) => STACK_RANK.set(tag, t * 100 + i)),
);

export const techStack: string[] = Array.from(
  new Set([
    /*
     * Hidden roles still contribute their tags. The panel's usual guarantee
     * is that everything on it is attached to work visible elsewhere on the
     * page, and this is the deliberate exception: hiding a row hides where
     * the work happened, not the skill. See `Role.hidden`.
     */
    ...roles.flatMap((role) => role.tags ?? []),
    ...projects.flatMap((project) => project.tags),
    ...EVIDENCED_STACK,
  ]),
)
  .filter((tag) => !NON_STACK_TAGS.has(tag))
  .map((tag, i) => ({ tag, i }))
  .sort(
    (a, b) =>
      // Unranked entries keep their authored order, after everything ranked.
      (STACK_RANK.get(a.tag) ?? Number.MAX_SAFE_INTEGER) -
        (STACK_RANK.get(b.tag) ?? Number.MAX_SAFE_INTEGER) || a.i - b.i,
  )
  .map((x) => x.tag);


/**
 * The number in the Level circle. Set by hand.
 *
 * On Steam, Level and Years of Service are genuinely two different stats —
 * level comes from badge XP, not from how long the account has existed — so
 * this being its own number is truer to the reference than reusing the years
 * was. But note what it costs: unlike everything else on the page, nothing
 * derives or checks this. See the note in CLAUDE.md.
 */
export const profileLevel = 26;

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
