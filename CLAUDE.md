# Project context for Claude Code

This file is read automatically by Claude Code when you open this folder.
It's a handoff from a chat session where the design and initial scaffold
were built — everything below is context so you don't have to re-explain it.

## What this is

Bradley's personal site, deliberately NOT a generic hover/scroll-animation
portfolio. It's structured like a Steam profile page, but every stat on it
is real, not decorative:
- Profile header = real "about me" info (name, location, current focus)
  plus a Level circle and "Years of Service" card, where level is years
  since his first commit rather than a game stat
- Favorite Project = Steam's "Favorite Game" slot, given to the highest-
  rarity project
- Item Showcase = real projects as an inventory grid, rarity tier = how
  central the project is to his work, with an always-visible detail list
  underneath (a monogram tile isn't self-describing the way item art is,
  and `title` never fires on touch)
- Recent Activity = recently-pushed repos in the "recently played" slot,
  then a live killfeed of his actual GitHub activity (commits, merged PRs,
  new repos) styled like a CS2 kill feed, refreshing every 5 min. The
  events-past-2-weeks count sits in the header bar, exactly where Steam
  shows "X hours past 2 weeks"
- Right sidebar = status, real GitHub counts (repos / followers /
  following / gists / member since), milestone badge tiles, a language
  breakdown, and a stars-ranked repo list in Steam's friends-list slot

Bradley's favorite games are CS2 and Valorant — that's where the killfeed
and future bhop mechanic come from. He explicitly does NOT want fake
scroll-triggered animations or decorative hover effects; every interactive
element should either be real data or a real mechanic.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind. No backend/database —
the GitHub activity feed calls the public GitHub REST API directly from a
server component with a 5-minute revalidate.

Versions are pinned on purpose: `next@14.2.35` / `react@18` (the App Router
API this was written against) and `tailwindcss@^3` (Tailwind v4 drops
`tailwind.config.ts` in favour of CSS `@theme`, which would break the token
rule below). Don't bump either without updating this file.

## Current file structure

- `lib/profile-data.ts` — all editable content (name, badges, projects,
  GitHub username). `githubUsername` is set to `brad945`, so the live
  data layer is on. **Still to fill in: real project links, real badge
  dates, and the LinkedIn URL** — those are marked `TODO(bradley)`.
  `PLACEHOLDER_GITHUB_USERNAME` is still exported as the "not configured"
  sentinel the empty states check against.
  `githubUsername` carries an explicit `: string` annotation — without it
  TypeScript infers the literal type and the placeholder comparisons
  elsewhere become "no overlap" build errors the moment it's edited.
  Until it's set the page prerenders fully static with the feed's empty
  state; once it's real the fetch appears and the route becomes ISR.
- `lib/github.ts` — one `getGitHubSnapshot()` call returns everything the
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
- `lib/codearena.ts` — live stats from Bradley's *own* product, not
  someone else's API. This is the block that makes "every number is
  fetched, not written" say something about him. Configured by
  `CODEARENA_STATS_URL` (see `.env.example`); the endpoint should return
  JSON with any subset of `submissions` / `matches` / `players` /
  `problems`. Unknown keys are ignored and non-finite values dropped, so
  a malformed or half-migrated response loses rows rather than rendering
  NaN. Unset, unreachable, non-OK, unparseable, or carrying no usable
  number -> returns null and the sidebar block **hides itself entirely**.
  It never invents a number. All four failure paths are verified.
- `components/ProfileHeader.tsx` — full-width identity block over the
  profile-background gradient: framed avatar, name, location, summary,
  and the right-hand Level circle + "Years of Service" card. Level is
  computed from `profile.codingSince`, so it counts up on its own.
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
     the top-left. But the range is **narrow** — medium greys
     (#8a8e94 → #575b61) throughout. A wide light-to-dark sweep reads as
     a completely different object.
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
- `components/SiteNav.tsx` — Steam's global header: dark full-width bar
  (`chrome` #171a21), wordmark left, uppercase nav items beside it,
  signed-in user + avatar right. Uppercase with tracking is wrong nearly
  everywhere else here but it's exactly what Steam's nav does, so it
  stays. The links are real in-page anchors rather than dead tabs — this
  is one page, and a nav of hrefs going nowhere is the fake chrome the
  site avoids. They target section heading ids (`#profile`,
  `#showcase-heading`, `#activity-heading`), so renaming those breaks
  them.
- `components/HeaderActions.tsx` — Steam's profile action row, sat where
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
- `components/NameHistory.tsx` — client component for the caret next to
  the name that opens Steam's alias history ("This user has also played
  as:"). Closes on Escape (returning focus to the caret) and on outside
  click. The dropdown anchors to the **caret**, not the name — the caret
  sits in its own `relative` span so that span is the containing block,
  putting the box's top-left directly under the arrow. Content comes from
  `aliases` in `lib/profile-data.ts` and is still placeholder.
- `components/ItemShowcase.tsx` — exports two panels. `FavoriteProject`
  is Steam's "Favorite Game" slot (capsule, copy, one oversized stat) for
  the highest-rarity project; the default export is the square inventory
  grid with rarity-coloured tile outlines and the "N Projects Shown"
  counter in the grid's leftover space. Tile detail lives in `title`.
- `components/ActivityFeed.tsx` — Steam's Recent Activity panel: "N events
  past 2 weeks" in the header bar, then recently-pushed repos as
  "recently played" rows (capsule + stars on record + last pushed + a
  commits-past-2-weeks bar scaled against the busiest repo on screen),
  then the CS2-style killfeed, then the View / All Activity | Repositories
  | Stars footer.
- `components/Sidebar.tsx` — the right column: status heading, stat rows
  (repos / followers / following / gists / member since), badge tiles,
  focus, a language breakdown, and a stars-ranked Top Repositories list
  that fills the slot Steam uses for the friends list.
- `components/AutoRefresh.tsx` — tiny client component that calls
  `router.refresh()` on the revalidate interval so the killfeed actually
  ticks over for someone leaving the tab open (ISR only revalidates on a
  new request; this supplies the request). Pauses while the tab is hidden.
- `components/Comments.tsx` — built but NOT wired into the page yet
  (deliberately parked). Uses giscus (GitHub Discussions-backed comments,
  not a fake widget). Needs `data-repo-id` / `data-category-id` from
  giscus.app once Discussions are enabled on the repo.
- `app/page.tsx` — full-width ProfileHeader, then a `lg:grid-cols-[2fr_1fr]`
  split (616 / 16 / 308 at `max-w-profile`, Steam's column widths) that
  stacks below `lg`. Comments import is commented out on purpose.
- `app/layout.tsx` — fonts (next/font), metadata, and the two fixed
  background layers (nebula glow, then a tiled starfield).

## Design tokens (already in tailwind.config.ts)

Dark theme, not a generic AI-slop palette:
- `base` #0c0d11, `panel` #15171e, `panel2` #1c1f29, `line` #2a2d3a
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
Fonts and not bundleable). Mulish is the standard free substitute and is
what's loaded, as a variable font so weights 200-300 are actually
available rather than being synthesised.

The scale lives as `.t-*` classes in `app/globals.css` and is measured off
the reference screenshots against a 940px column. Four traits carry most
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

Composite gradients are tokens too, under `backgroundImage`: `page-glow`,
`starfield`, `profile-hero`, `panel-header`, `avatar-frame`, `xp-fill`.
Reusable Steam-shaped classes (`.panel`, `.panel-bar`, `.stat-row`,
`.steam-link`, `.steam-button`) live in `app/globals.css`.

Rarity tiers (`rarity.core` / `rarity.major` / `rarity.side`) are derived
from `accent` / `nebula` / `muted` so the showcase can't drift off-palette.
Class strings per tier live in `rarityStyles` in `lib/profile-data.ts` and
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
3. **Wire up Comments.tsx** into `app/page.tsx` once Bradley has enabled
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
  that still holds: no Valve logo or wordmark, no Steam brand assets, no
  game capsule art. Every capsule, frame, and badge tile on this site is
  generated from the palette. Keep the footer's "not affiliated" line.
- Don't hardcode colors outside the token system in `tailwind.config.ts`.
