# Project context for Claude Code

This file is read automatically by Claude Code when you open this folder.
It's a handoff from a chat session where the design and initial scaffold
were built — everything below is context so you don't have to re-explain it.

## What this is

Bradley's personal site, deliberately NOT a generic hover/scroll-animation
portfolio. It's structured like a Steam profile page, but every stat on it
is real, not decorative:
- Profile header = real "about me" info (name, location, current focus)
  plus a Level circle and "Years of Coding" card. These are two
  different numbers now, as they are on Steam, where level comes from
  badge XP and has nothing to do with account age. Years of Coding is
  derived from `profile.codingSince` and picks its own badge art.
  **`profileLevel` (20) is hand-set** — nothing derives or checks it, so
  it joins `codingSince` and the badge dates on the list of values that
  can't self-correct. Bradley asked for it directly
- Favorite Project = Steam's "Favorite Game" slot, given to the highest-
  rarity project
- Item Showcase = real projects as an inventory grid, rarity tier = how
  central the project is to his work, with an always-visible detail list
  underneath (a monogram tile isn't self-describing the way item art is,
  and `title` never fires on touch)
- Recent Activity = hand-picked repos in Steam's "recently played" slot,
  each with a commits-past-2-weeks strip where Steam puts achievement
  progress — **hidden entirely when that count is 0**, since a row reading
  "Commits past 2 weeks: 0" is noise. It's live, so it reappears by itself
  on the next commit. Language and recency moved into the right-hand meta
  so they survive when the strip is hidden. The same figure, summed, sits in the header bar exactly where
  Steam shows "X hours past 2 weeks". A CS2-style killfeed lived here and
  was **removed** at Bradley's request — it duplicated what the repo rows
  already said
- Experience & Projects = roles and built things in **one** panel. They
  were two, which split the same story in half and listed UCSB and BRI
  Youth in both. Those two are kept as roles only, since that's where the
  org and dates live. **Order is manual on both lists** — rendered in
  `profile-data` array order. A newest-first date sort was added and then
  reverted within the hour: Bradley wants Crossing Hurdles below DevEval
  despite starting five months later, and that's precisely what sorting
  by date can't express. Don't re-add it. Roles are hand-maintained
  (LinkedIn has no public API); project rows pull live commits and
  language via `ghRepo`
- Right sidebar = status, real GitHub counts (repos / followers /
  following / gists / member since), milestone badge tiles, a language
  breakdown, and a stars-ranked repo list in Steam's friends-list slot

Bradley's favorite games are CS2 and Valorant — that's where the future
bhop mechanic comes from. He explicitly does NOT want fake
scroll-triggered animations or decorative hover effects; every interactive
element should either be real data or a real mechanic.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind. No backend/database —
the GitHub activity feed calls the public GitHub REST API directly from a
server component with a 5-minute revalidate.

Versions are pinned on purpose: `next@14.2.35` / `react@18` (the App Router
API this was written against) and `tailwindcss@^3` (Tailwind v4 drops
`src/tailwind.config.ts` in favour of CSS `@theme`, which would break the token
rule below). Don't bump either without updating this file.

## Repo layout

Flattened to 8 top-level entries at Bradley's request (it was 13). All
source lives under `src/` — `app/`, `components/`, `lib/` and the Tailwind
config. `public/`, `package.json`, `package-lock.json`, `tsconfig.json`,
`next.config.mjs`, `.gitignore` and this file are the rest.

Two things moved somewhere non-obvious, so look here before recreating them:
- **PostCSS config is the `postcss` key in `package.json`**, not
  `postcss.config.mjs`. Next's own `findConfig` checks `package.json`
  first, so this is a supported location, not a hack. It carries the
  Tailwind config path.
- **`.env.example` is gone**; its contents are the "Environment" section
  at the bottom of this file.

`src/tailwind.config.ts`'s `content` globs stay **root-relative**
(`./src/**/*`). Tailwind only rebases them onto the config file's own
directory when `content.relative` is set, which it isn't — so writing
them relative to `src/` would silently match nothing and every utility
class would stop emitting.

## Current file structure

- `src/lib/profile-data.ts` — all editable content (name, badges, projects,
  GitHub username). `githubUsername` is set to `brad945`, so the live
  data layer is on. Projects are real now — every `blurb` is the repo's
  own GitHub description, copied verbatim so it can be checked.
  **Two invented values remain and they undercut the site's whole claim:**
  `profile.codingSince` (2019-09-01) is a placeholder from the original
  scaffold and it is what `Level` counts from, and all four `badges` dates
  are made up. Everything else on the page is fetched. Also outstanding:
  the LinkedIn URL, real project start dates, and the `tags` marked
  `TODO(bradley)` as inferred rather than known.
  `PLACEHOLDER_GITHUB_USERNAME` is still exported as the "not configured"
  sentinel the empty states check against.
  `githubUsername` carries an explicit `: string` annotation — without it
  TypeScript infers the literal type and the placeholder comparisons
  elsewhere become "no overlap" build errors the moment it's edited.
  Until it's set the page prerenders fully static with the feed's empty
  state; once it's real the fetch appears and the route becomes ISR.
- `src/lib/github.ts` — one `getGitHubSnapshot()` call returns everything the
  page needs from three requests: user stats, public events, and owned
  repos. It also derives the 2-week event count, per-repo commit counts
  over the same window, a language breakdown, and a stars-ranked repo
  list — all from those three responses, no extra calls. Never throws:
  bad username, rate limit, or a network failure all degrade to an empty
  snapshot with an `error` string, so a placeholder username can't break
  the build or 500 the page. Reads `GITHUB_TOKEN` from the environment if
  present (raises the rate limit from 60/hr/IP to 5000/hr) but works fine
  without one. Forks and archived repos are filtered out — they'd
  dominate the "recently played" slot without saying anything.
- Featured repos — `getFeaturedRepos()` in `src/lib/github.ts`, driven by
  `featuredRepos` in `profile-data.ts`, rendered by `FeaturedRepoRow` in
  `ActivityFeed` and by the sidebar's Active Repositories block.
  **This replaced the automatic "most recently pushed public repo" list**,
  which was structurally incapable of showing the real work: it could only
  see public repos Bradley *owns*, so it surfaced years-old intro projects
  while missing both his private repos and the ones he contributes to as a
  collaborator. (Watch for this — a `ownerAffiliations: OWNER` query hides
  collaborations entirely.)
  Commits are always reported as **"yours / total"**, never the repo total
  alone: on `sennaicodes/codearenamvp` that's 155 of 2,782, and quoting
  2,782 would overstate his part 18x on a page a reader can check. The
  sidebar list ranks by *his* commits, not stars, because every public repo
  he owns has zero stars.
  Private entries are named deliberately (they're hand-picked) but are
  **not linked** — a visitor gets a 404. Needs `GITHUB_TOKEN`; without one
  both blocks fall back to the public/starred lists rather than emptying.
  Don't add coursework repos to `featuredRepos`.
- `src/components/Experience.tsx` — work history in the "recently played" row
  shape, fed by `roles` in `profile-data.ts`. Transcribed verbatim from
  Bradley's LinkedIn; don't embellish it, and remember it's the only panel
  that can go stale silently since there's nothing to fetch.
- `src/components/ContributionSummary.tsx` — contributions as counts, not a
  chart. A weekly bar chart lived here first; it showed *when* the work
  happened but never what it was, which is the question a reader actually
  has. Fed by `getContributions()` in `src/lib/github.ts` — **GraphQL, so
  auth-only**: no `GITHUB_TOKEN`, no panel.
  The type breakdown comes from **author-scoped search**, not from
  `contributionsCollection.total*Contributions`. Those count public
  contributions only, so for this account they report "0 pull requests"
  while search finds 6 — 442 of 452 contributions are private and the
  typed fields simply don't see them. Don't switch back to them.
  Requires **"Include private contributions on my profile"** enabled, or
  the total collapses to public activity alone (10 vs 452).

- `src/lib/deveval.ts` — live stats from Bradley's *own* product (called
  CodeArena until mid-2026; the backing repo is still `codearenamvp`, and
  `FAVORITE_REPO` / `ghRepo` must keep that name because they're API
  identifiers, not display text), not
  someone else's API. This is the block that makes "every number is
  fetched, not written" say something about him. Configured by
  `DEVEVAL_STATS_URL` (see Environment, below); the endpoint should return
  JSON with any subset of `submissions` / `matches` / `players` /
  `problems`. Unknown keys are ignored and non-finite values dropped, so
  a malformed or half-migrated response loses rows rather than rendering
  NaN. Unset, unreachable, non-OK, unparseable, or carrying no usable
  number -> returns null and the sidebar block **hides itself entirely**.
  It never invents a number. All four failure paths are verified.
- `src/components/ProfileHeader.tsx` — identity block: framed avatar,
  name, summary, then the Level circle + "Years of Coding" card and the
  action buttons **below it, not beside it**. This was Steam's 2fr/1fr
  header split and was the last grid in the app; it was collapsed when
  Bradley asked for one big column. The Years card carries `w-fit`
  because it no longer has a narrow track to bound it. Level is
  computed from `profile.codingSince`, so it counts up on its own.
  The right-hand block is matched to the reference by ratio, not by eye.
  Against the "Level" font-size: **circle diameter 1.08x**, ring 6.4% of
  the diameter, numeral 0.44x the diameter, gap 0.20x. At 34px that's
  37 / 2 / 16 / 7. The circle being roughly the *same size as the word* is
  the load-bearing part — an earlier pass at 1.29x read as obviously
  oversized. The Years of Service card is deliberately the **plain flat
  version** — a near-black panel with a bevelled rounded badge tile was
  tried and reverted at Bradley's request. Don't reintroduce it. There is deliberately **no XP bar** between the card
  and the buttons — the reference has none, and it was another meter
  without a meaningful denominator.
  The avatar frame is a **static grey band**, matched to the reference on
  three points that are easy to get wrong:
  1. **The bands are asymmetric, and thinner than they look.** Measured
     off the reference: sides are **10.6%** of the photo's width,
     top/bottom **6.1%** of its height (76px and 43.5px against a
     720x717 photo) — a 1.75 ratio. On the 150px avatar that's a 16 / 9
     band, which with the 1px bevel means `px-[15px] py-[8px]`. Equal
     padding is obviously wrong, and anything thicker stops reading as
     a frame.
  2. **The gradient is radial, not linear**, with the light source off
     the top-left. The range stays inside medium grey
     (#9a9ea4 → #4b4f55) — widened once, by request, from an earlier
     #8a8e94 → #575b61 that read nearly flat. That's about as far as it
     goes: a genuinely wide light-to-dark sweep stops reading as a
     brushed-metal frame and becomes a different object.
  3. **It's a 3D bevel, not a flat band.** Light on the top/left edges,
     dark on the bottom/right, with the photo in a sunken well below it
     (the reverse: dark top/left, light bottom/right). `frameHi` /
     `frameLo` are those two edge colours.
  The DVD logo is sized off the reference too — ~42% of the photo width.
  Here that's 64x36 (43.2%), rounded to the nearest size whose travel
  divides evenly by the step count; see the jitter note below.
  The only thing that moves or changes colour is the DVD logo bouncing
  screensaver-style inside the 150px box. It changes colour **only on
  wall contact**, like the real screensaver. `tintKeyframes()` builds
  that: with `alternate`, each axis ends an iteration against a wall,
  so hits land every 1.5s (x) and 1.7s (y), and the pattern repeats
  every 51s — the lcm of the two full there-and-back cycles. That's
  62 hits, two of them corners (25.5s and 51s) where both axes land
  at once. Each hit gets a keyframe stop carrying `steps(1)` so the
  colour holds flat until the next one instead of interpolating.
  **The x/y durations and `HIT_CYCLE` are load-bearing** — change a
  bounce duration without recomputing the lcm and the tint drifts off
  the walls. Pure CSS, no JS.
  In `DvdLogo` the glyphs are **drawn as SVG paths, not set in a font**.
  The mark's letterforms are squat and slab-heavy with tight counters;
  no webfont at any weight gets close, which is why passes that used
  `<text>` at 900 kept reading wrong however much they were nudged. Each
  D is a single `evenodd` path (outer shell then counter), `skewX(-14)`
  supplies the italic slant, and the ellipse is a thick ring the wordmark
  overlaps — at small sizes the open centre plus the VIDEO lettering is
  what reads as a disc.
  The bounce needs two nested spans (one element carries one transform
  animation) and the travel distances in the `dvd-x` / `dvd-y` keyframes
  are hard-coded against the avatar's 148px padding box and the 64x36
  logo — **resize one and you must resize the other**. The bounce runs on `steps(15, jump-none)` /
  `steps(17, jump-none)`, i.e. duration x 10, which pins it to the original
  screensaver's chunky 10fps; change a duration and you must change its
  step count to hold that framerate. Keep durations at whole tenths so
  the step count stays an integer, and keep the two sharing no common
  factor or the path visibly loops. **Travel must divide evenly by its
  step count** (84/14 = 6px, 112/16 = 7px) — a fractional step lands the
  logo on a new subpixel phase each frame, so the browser re-antialiases
  the letterforms and it visibly jitters.
  Two things make the logo actually touch the walls, and it silently
  stops short if either regresses: the timing function must be
  **`jump-none`** (the default `jump-end` emits k/n for k=0..n-1 and so
  never reaches 1, leaving it one step short), and the SVG's **viewBox
  must be cropped to the mark's ink bounds** — a 0-0-110-62 box carries
  ~4px of transparent padding under the ellipse, so the element box can
  touch a wall while the logo visibly doesn't. Recompute the viewBox if
  a glyph, the skew, or the ellipse stroke changes.
  `DvdLogo` is drawn from SVG primitives
  (skewed wordmark over an ellipse) rather than embedding the real logo
  file, and paints entirely with `currentColor` so one animated `color`
  drives it.
  The header must **not** get `overflow-hidden` — it would clip the alias
  dropdown. The gradient overlay is `absolute inset-0`, so nothing spills.
- `src/components/SiteNav.tsx` — Steam's global header: dark full-width bar
  (`chrome` #171a21), wordmark left, uppercase nav items beside it,
  signed-in user + avatar right. Uppercase with tracking is wrong nearly
  everywhere else here but it's exactly what Steam's nav does, so it
  stays. The links are real in-page anchors rather than dead tabs — this
  is one page, and a nav of hrefs going nowhere is the fake chrome the
  site avoids. They target section heading ids (`#profile`,
  `#experience-heading`, `#activity-heading`, `#showcase-heading`), so
  renaming those breaks them. `scroll-behavior: smooth` plus a 64px
  `scroll-padding-top` on `html` eases to the section and keeps the
  heading clear of the nav; both are disabled under
  `prefers-reduced-motion`.
- `src/components/HeaderActions.tsx` — Steam's profile action row, sat where
  Steam puts Edit Profile. Every visitor is "someone else", so it mirrors
  Steam's other-profile set rather than Edit — pared to **Message /
  More ⋯**, since mailing Bradley is the action a visitor is actually
  likely to want, and three top-level buttons made none of them read as
  primary. Follow lives inside the menu. The menu anchors to the More
  button's own `relative` span, not the row, and is right-aligned to it —
  More is the rightmost control, so a left-aligned panel would overhang
  the column.
  The ⋯ menu deliberately does NOT ape Steam's contents (Add to
  favorites, Block all communication, Report violation) — none have a
  real equivalent, and a menu of dead entries is the fake chrome this
  site avoids. Besides Follow, the items point at the machinery behind the page:
  **View source**, **View raw API response** (`api.github.com/users/:login`
  — the JSON the page is built from) and **Activity feed**
  (`github.com/:login.atom` — the same events as the killfeed). Closes on
  Escape and outside click like NameHistory.
  A "Copy profile link" entry was tried and cut: Steam needs one because
  its profile URLs are long numeric strings, but this is one page whose
  URL is already in the address bar, so it filled a slot rather than
  earning one. Removing it also removed the clipboard code, which needed
  a focused document and so could never be verified headlessly.
  **View source only renders when the repo is actually public.** The
  unauthenticated `/users/:u/repos` endpoint returns public repos only, so
  `snapshot.publicRepoNames` is a truthful visibility check — the row
  appears by itself the day the repo is flipped public, and until then it
  can't send visitors to a 404.
- `src/components/NameHistory.tsx` — client component for the caret next to
  the name that opens Steam's alias history ("This user has also played
  as:"). Closes on Escape (returning focus to the caret) and on outside
  click. The dropdown anchors to the **caret**, not the name — the caret
  sits in its own `relative` span so that span is the containing block,
  putting the box's top-left directly under the arrow. Content comes from
  `aliases` in `src/lib/profile-data.ts` and is still placeholder.
- `src/components/ItemShowcase.tsx` — exports two panels. `FavoriteProject`
  is Steam's "Favorite Game" slot. `FAVORITE_REPO` picks which repo, and
  the matching `projects` entry is found by id == repo name lowercased.
  Its copy comes from the **live repo description**, not `profile-data` —
  the hand-written blurb had drifted to "competitive programming platform"
  while the repo itself said "evidence-first technical interviews". The
  panel bar carried a commit count and no longer does — removed at
  Bradley's request; the same figure is still on the DevEval row in
  Experience & Projects, so nothing was lost. Tags stay hand-curated; the
  API has no equivalent. Falls back to the `profile-data` entry without a
  token.
  The default export is the default export is the square inventory
  grid with rarity-coloured tile outlines and the "N Projects Shown"
  counter in the grid's leftover space. Tile detail lives in `title`.
- `src/components/ActivityFeed.tsx` — Steam's Recent Activity panel: the
  commits-past-2-weeks total in the header bar, then a row per featured
  repo. Each row's progress strip is **commits in the last two weeks**,
  author-scoped — it replaced a "your share of commits" bar that measured
  the wrong thing, since what fraction of a repo someone wrote says
  nothing about whether they're working on it now. The header count is
  summed from the rows rather than using `stats.eventsPast2Weeks`, which
  sees only public events and reads near-zero for a mostly-private
  account. `PublicRepoRow` is the no-token fallback.
- `src/components/Sidebar.tsx` — the right column: status heading, stat rows
  (repos / followers / following / gists / member since), badge tiles,
  focus, a language breakdown, and a stars-ranked Top Repositories list
  that fills the slot Steam uses for the friends list.
- `src/components/AutoRefresh.tsx` — tiny client component that calls
  `router.refresh()` on the revalidate interval so the killfeed actually
  ticks over for someone leaving the tab open (ISR only revalidates on a
  new request; this supplies the request). Pauses while the tab is hidden.
- `src/components/Comments.tsx` — built but NOT wired into the page yet
  (deliberately parked). Uses giscus (GitHub Discussions-backed comments,
  not a fake widget). Needs `data-repo-id` / `data-category-id` from
  giscus.app once Discussions are enabled on the repo.
- `src/app/page.tsx` — SiteNav, ProfileHeader, then **one column**, at
  Bradley's request. This was Steam's `lg:grid-cols-[2fr_1fr]` split
  (649 / 16 / 325 at `max-w-profile`) which stacked below `lg`; the
  single column is that stacked order applied at every width, so the
  sidebar panels now sit under the main ones. `max-w-profile` is 990px,
  widened from Steam's 940 by 25px per side. Main column order:
  **Favorite Project, Experience, Recent Activity, Item Showcase**.
  Contributions moved to the sidebar — as five short counts it never
  needed the main column's width. Comments import is commented out on purpose.
- `src/app/layout.tsx` — fonts (next/font), metadata, and the two fixed
  background layers (nebula glow, then a tiled starfield).

## Design tokens (already in tailwind.config.ts)

**The palette is Steam's own, taken from their stylesheets** — `#1b2838`
is `body` in `globalv2.css`, `#171d25` is `#global_header`, `#8f98a0` is
their body text, `#66c0f4` their link blue, and `#c7d5e0` their bright
text. The panel fills are derived, not guessed: Steam paints profile
cards `rgba(0,0,0,.3)` and status blocks `rgba(0,0,0,.5)` over the page,
so `panel`/`panel2` are those composited over `#1b2838`, and `line` is
their `rgba(255,255,255,.1)` border done the same way.

The purple scheme it replaced (`base` #0c0d11, `hero` #33203b and the
plum/wine profile gradient) is gone — `hero` is now the page colour, so
the header reads as part of the page rather than a card on it.

- `base` #1b2838, `panel` #131c27, `panel2` #0e141c, `line` #323e4c
- `ink` #e9e7e2 (text), `muted` #8b90a0
- `accent` #de9b35 (CS2-orange, used sparingly)
- `nebula` #5b3fae (background glow / gradient accent)
- `live` #5cc98f (online status / success)
- `link` #66c0f4 (links and repo names)
- `plum` #3f2350, `wine` #2b1526 (profile-background gradient)
- `teal` #2f5d6e (left stop of the panel header bar)
- `steel` #8e9199 (avatar frame band), `menu` #464c58 (alias dropdown)
- Text ramp: `bright` #ffffff (headings), `ink` #e5e8ea, `copy` #c6d4df
  (body), `muted` #8f98a0. Steam runs cool blue-greys — the old warm
  #e9e7e2 `ink` read wrong against everything else.
- Fonts: Mulish (display + body), JetBrains Mono (killfeed and `.label`
  chrome only)

## Typography

Steam's own face is **Motiva Sans** (Typotheque, licensed — not on Google
Fonts and not bundleable). It now leads the `display` and `body` stacks in
`src/tailwind.config.ts`, so a visitor who already owns and has installed
it sees it — but **the site does not and cannot load it**. Self-hosting
the file needs a paid Typotheque webfont licence. Don't "fix" this by
adding an @font-face pointing at a copied file.

**Open Sans** is therefore what renders for essentially everyone. Bradley
picked it over Mulish (the previous substitute), Nunito Sans, Source
Sans 3, IBM Plex Sans and Inter, from a side-by-side of all six set in
this page's own headings at its own sizes.

**Open Sans has no 200 weight** — the family starts at 300. Steam's
headings are weight 200, so every `font-extralight` here became
`font-light`; the CSS states the weight that actually renders instead of
asking for one that silently clamps. Don't "restore" 200.

The scale lives as `.t-*` classes in `src/app/globals.css` and is taken
**from Steam's own `profilev2.css`**, not estimated off screenshots:
persona name 24/200/lh40, panel header 16/200/lh30, stat 24/200, big stat
34/200, label 14, body 13. The eyeballed values it replaced ran 17-41%
large and about double the weight on headings. Check their stylesheet
before changing any of these. Four traits carry most
of the resemblance, and all four are easy to lose:
- **very light weights** (200-300) on anything large — sidebar counts and
  the showcase counter are weight 200, the persona name 300
- **no letter-spacing and no uppercase** outside the tiny mono `.label`
  used by the killfeed. Tracked uppercase is the single most un-Steam
  thing you can add
- **pure white for headings, blue-grey for copy** — not one flat colour
- **tight leading on headings, ~1.5 on body**

`.panel-bar-title` / `.panel-bar-meta` / `.stat-label` / `.stat-value`
are aliases onto that scale, so restyling the scale restyles the page.

**No gradients.** Every decorative gradient was removed — the page glow,
the profile-hero sweep, the teal-to-purple panel bars, the panel sheen and
the xp fill are all gone, replaced by flat fills (`hero`, `teal/60`).
Two things under `backgroundImage` survive and neither is decoration:
`starfield` (12 radial-gradients that each paint a single 1px dot) and
`avatar-frame` (material shading — the reference frame is genuinely lit
from the top-left, and flattening it makes the bevel vanish). Don't add
new ones.
Reusable Steam-shaped classes (`.panel`, `.panel-bar`, `.stat-row`,
`.steam-link`, `.steam-button`) live in `src/app/globals.css`.

Rarity tiers (`rarity.core` / `rarity.major` / `rarity.side`) are derived
from `accent` / `nebula` / `muted` so the showcase can't drift off-palette.
Class strings per tier live in `rarityStyles` in `src/lib/profile-data.ts` and
are written out in full — Tailwind's scanner can't see concatenated names.

## Explicitly NOT built yet — do these next, in this order

1. **Bhop/strafe-timing canvas** as an entry gate before the page reveals.
   Real skill-based mechanic (WASD + jump timing / simple physics), not a
   decorative loading animation. Should have a skip option — don't hard-gate
   the site behind it.
2. **Radar-style "about me" map** — a custom map-like layout (doesn't need
   to be a literal CS2 map, can be styled abstractly) where pins are skill
   categories. Clicking a pin opens a loadout-card style panel (rarity-tiered
   tech stack grid, similar visual language to Item Showcase).
3. **Wire up Comments.tsx** into `src/app/page.tsx` once Bradley has enabled
   GitHub Discussions on the repo and has real giscus IDs.

## Deployment (Bradley needs to do the account-specific parts himself)

1. `npm install && npm run dev` to run locally.
2. `git init`, create a GitHub repo named `bradleytsou-site`, push.
3. Import that repo on vercel.com (auto-detects Next.js, zero config needed).
4. Buy `bradleytsou.com` or `bradleytsou.dev` (Porkbun or Namecheap).
5. In Vercel → Settings → Domains, add the domain; Vercel gives an A record
   + CNAME to add at the registrar's DNS settings. Propagates in under an hour.

Optional: add `GITHUB_TOKEN` (a fine-grained PAT with no scopes — it only
needs to be a valid token) as a Vercel environment variable if the feed
ever hits the unauthenticated rate limit.

## No decorative meters

Two progress bars were removed for the same reason and the rule now stands:
**a bar needs a denominator that means something.** Both the repo-row bar
(scaled against whichever featured repo was busiest) and the sidebar
language bars (scaled against the most-used language) were shapes that
looked like progress while measuring nothing — decoration dressed as data,
which is exactly what this site exists not to do. Both are plain numbers now.

The one surviving bar is the XP fill under Years of Service, because "90%
to 7" is a real fraction of a real year. Apply that test to any new meter.

## Things to avoid

- No fake/decorative animations — every interactive element should be real
  data or a real mechanic, per Bradley's explicit brief. Two deliberate
  exceptions, both replications of actual Steam features Bradley asked
  for: the animated avatar frame (DVD-screensaver bounce) and the status
  pulse. Neither is scroll-triggered and neither is a hover effect. Don't
  read these as licence to add decorative motion elsewhere.
- **Close visual fidelity to Steam's profile layout is intentional** —
  Bradley asked for it directly, superseding the earlier "inspired by the
  structure of, not a literal skin" note. Don't undo it. The carve-out
  that still holds: no Valve logo or wordmark, no game capsule art, and
  every capsule and frame on this site is generated from the palette.
  Keep the footer's "not affiliated" line.
  **One deliberate exception, added at Bradley's explicit request after
  the tradeoff was put to him:** `public/steam-years-*.png` are Valve's
  real Years of Service badges, served for the card in `ProfileHeader`.
  They are the only Steam-owned assets here. Keyed off `level` rather
  than hardcoded, so the art tracks the number beside it; years past
  `STEAM_BADGE_YEARS` fall back to the generated tile. Don't generalise
  this into permission for other Steam artwork.
- Don't hardcode colors outside the token system in `src/tailwind.config.ts`.

## Environment

Both optional; this was `.env.example` before the repo was flattened. Put
real values in `.env.local`, which `.gitignore` already covers.

```sh
# Optional. Raises the GitHub API rate limit from 60/hr/IP to 5000/hr.
# A fine-grained PAT with no scopes is enough — it only needs to be valid.
GITHUB_TOKEN=

# Optional. Points the sidebar's DevEval block at your own API.
# Expects JSON with any subset of these keys; unknown keys are ignored and
# non-numeric values are dropped:
#   { "submissions": 1204, "matches": 318, "players": 96, "problems": 42 }
# Unset, unreachable, or unusable -> the block hides itself. It never
# invents a number.
DEVEVAL_STATS_URL=
```

Without `GITHUB_TOKEN` the status line, contributions, languages and every
featured-repo row degrade to their empty states — the page still builds.
It is needed in Vercel's environment variables too, not just locally.
