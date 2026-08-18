import type { Rarity } from "@/lib/profile-data";

/**
 * Everything the `/about` page says. All editable, all Bradley's to write.
 *
 * ## What this page is for
 *
 * `/` is the formal one — work, roles, repos, the things a recruiter reads.
 * This is the other half: what he actually does, likes and plays.
 *
 * It's built out of **the Steam surfaces the profile page didn't claim** —
 * Reviews, Inventory, Achievements — rather than as prose. That's deliberate
 * and it's the whole idea: the profile page earns its credibility by being all
 * data, and three paragraphs of "I'm passionate about…" here would break that
 * spell on the same site. Everything personal goes in a Steam-shaped
 * container.
 *
 * ## Almost all of this is placeholder
 *
 * Marked `TODO(bradley)` where it's invented. **The achievements are real**
 * — every one is drawn from something already documented in `profile-data`
 * — and the reviews are not: they're written in a plausible voice to show the
 * shape, and should be replaced wholesale. Nothing here is fetched, so nothing
 * here self-corrects.
 */

/* -------------------------------------------------------------------------
 * Reviews
 * ---------------------------------------------------------------------- */

export interface Review {
  /** The thing being reviewed. Doesn't have to be a game — that's the joke. */
  subject: string;
  recommended: boolean;
  /**
   * Free text, so it can be honest about its own precision: a bare figure
   * where it's measured, a `~` where it's a guess. Steam only ever shows real
   * numbers; this page mixes both, so the tilde is load-bearing rather than
   * decorative.
   *
   * A string rather than a number for exactly that reason — a number field
   * would have to render one way and would quietly launder an estimate into a
   * measurement.
   *
   * **Ignored when `appId` is set and the lookup succeeds**, in which case it
   * is only the fallback for a missing key.
   */
  hours: string;
  /**
   * Steam app id, for a review of an actual game.
   *
   * Set it and the hours come from Steam instead of from `hours` above. This
   * exists because the placeholder here read "1,284 hrs on record" while the
   * Favorite Game panel two clicks away read the real 1,073.4 — an invented
   * number contradicting a fetched one on the same site is precisely what
   * everything else here is built to avoid.
   */
  appId?: number;
  /** One or two sentences. Deadpan travels further than enthusiastic. */
  body: string;
}

/**
 * **All placeholder.** Written to show the shape and the tone — replace them.
 *
 * The negative ones are where the personality is; one honest "not
 * recommended" says more than five positives. Keep at least one.
 */
export const reviews: Review[] = [
  {
    subject: "Piano",
    recommended: true,
    hours: "~4,000 hrs on record", // TODO(bradley): a real figure if you have one
    body: "No tutorial and a brutal difficulty curve — the first 500 hours are unplayable by anyone else. Endgame content is unmatched. Best played in front of people who did not ask.",
  },
  {
    subject: "Counter-Strike 2",
    recommended: true,
    appId: 730,
    hours: "hours unavailable", // only shown if STEAM_API_KEY is missing
    body: "Ruined my wrists and my sleep schedule. Still the best movement in any game, which is the entire reason there's a bhop page on this site.",
  },
  {
    subject: "Teaching pre-algebra to someone who hates it",
    recommended: true,
    hours: "175+ hrs logged", // real: BRI Youth, see profile-data
    body: "Difficulty scales with how much they've already decided they're bad at it. Genuinely the best feeling in the game when it finally lands.",
  },
  {
    subject: "Waking up at 6am",
    recommended: false,
    hours: "19 hrs on record", // TODO(bradley)
    body: "Refunded.",
  },
];

/* -------------------------------------------------------------------------
 * Inventory
 * ---------------------------------------------------------------------- */

export interface InventoryItem {
  /** Two or three characters. Stands in for item art, as the showcase tiles did. */
  code: string;
  name: string;
  /**
   * **Rarity here means how much of his life the thing takes up**, not what it
   * cost or how rare it is. Same scale the projects use, different question —
   * which is the point: on the profile page it ranks work, here it ranks life.
   */
  rarity: Rarity;
  note: string;
}

/** **All placeholder** except Exy. TODO(bradley): make these your actual things. */
export const inventory: InventoryItem[] = [
  { code: "VLN", name: "Violin", rarity: "core", note: "Since before I could choose." },
  { code: "KEY", name: "Piano", rarity: "core", note: "The one I'd keep." },
  { code: "EXY", name: "Exy", rarity: "core", note: "Walks around this site. Try clicking his tail." },
  { code: "PC", name: "Desktop", rarity: "major", note: "Built it, regret nothing, would do it worse next time." },
  { code: "BOBA", name: "Boba", rarity: "major", note: "Half sugar, less ice." },
  { code: "CS2", name: "Knife", rarity: "side", note: "Cost more than it should have." },
];

/* -------------------------------------------------------------------------
 * Achievements
 * ---------------------------------------------------------------------- */

export interface Achievement {
  name: string;
  detail: string;
  /** Free text, or null when it isn't unlocked. */
  date: string | null;
  unlocked: boolean;
}

/**
 * **These are real** — each one is drawn from something already stated in
 * `profile-data`, so they can be checked against the rest of the site.
 *
 * Deliberately **no rarity percentages.** Steam shows "12.4% of players have
 * this", and that number is measured; here it could only ever be invented, and
 * an invented percentage next to real dates would poison both.
 *
 * Keep at least one locked. It's funnier than a full sheet, and it's the only
 * row that says anything about what he's doing next.
 */
export const achievements: Achievement[] = [
  {
    name: "Won a hackathon",
    detail: "Cal Hacks 12.0 — 1st on the Bright Data track, out of 700 projects",
    date: "2025",
    unlocked: true,
  },
  {
    name: "Tutor of the Month, three times",
    detail: "BRI Youth — 175+ hours logged",
    date: "2020 – 2024",
    unlocked: true,
  },
  {
    name: "Played a recital in a public library",
    detail: "Violin and piano, BRI Youth",
    date: "2020 – 2024",
    unlocked: true,
  },
  {
    name: "Shipped something people pay for",
    detail: "DevEval — founding engineer",
    date: "2026",
    unlocked: true,
  },
  {
    name: "Bhop consistently",
    detail: "Still locked. The /play page is the plan.",
    date: null,
    unlocked: false,
  },
];

/**
 * Tile outline per rarity, written out in full.
 *
 * Tailwind's scanner reads source as text and can't see a class name built by
 * concatenation — the same reason the deleted showcase kept its own strings
 * spelled out. Reusing the palette rather than new colours so the two pages
 * can't drift apart.
 */
export const rarityTile: Record<Rarity, string> = {
  core: "border-accent/60 text-accent",
  major: "border-nebula/70 text-nebula",
  side: "border-line text-muted",
};

/* -------------------------------------------------------------------------
 * Books
 * ---------------------------------------------------------------------- */

export interface Book {
  title: string;
  author: string;
  /**
   * Where it is for him, not a rating.
   *
   * "reading" is the one that makes the shelf worth having — it's the only
   * row that changes, and it's the only one that says anything about now.
   */
  status: "reading" | "read" | "shelved";
  /** One line. Why it's here, not what it's about — a summary is a blurb. */
  note?: string;
}

/**
 * The bookshelf.
 *
 * **Hand-kept, and it has to be.** This is the case the Recent Activity
 * placeholder already calls out: Spotify and YouTube have APIs, books don't —
 * Goodreads killed its API in 2020 and nothing replaced it. So this is a
 * written list, and the panel says so rather than implying it's fetched.
 *
 * That's allowed here for the same reason `roles` is: a hand-kept list is
 * honest as long as nothing pretends otherwise. What isn't allowed is a
 * progress bar or a page count that looks measured.
 *
 * **All placeholder.** TODO(bradley): your actual shelf.
 */
export const books: Book[] = [
  {
    title: "The Pragmatic Programmer",
    author: "Hunt & Thomas",
    status: "reading",
    note: "Everyone cites it. Finding out why.",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    status: "read",
    note: "Half of the UCSB dining-hall study was arguing with this.",
  },
  {
    title: "The Art of Doing Science and Engineering",
    author: "Richard Hamming",
    status: "read",
  },
  {
    title: "Gödel, Escher, Bach",
    author: "Douglas Hofstadter",
    status: "shelved",
    note: "Bought it twice. Opened it once.",
  },
];
