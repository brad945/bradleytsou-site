# Project context for Claude Code

This file is read automatically by Claude Code when you open this folder.
It's a handoff from a chat session where the design and initial scaffold
were built — everything below is context so you don't have to re-explain it.

## What this is

Bradley's personal site, deliberately NOT a generic hover/scroll-animation
portfolio. It's structured like a Steam profile page, but every stat on it
is real, not decorative:
- Profile header = real "about me" info (name, location, current focus)
  plus a Level circle and "Years of Experience" card. These are two
  different numbers now, as they are on Steam, where level comes from
  badge XP and has nothing to do with account age. Years of Experience is
  derived from `profile.codingSince` and picks its own badge art.
  **`profileLevel` (26) is hand-set** — nothing derives or checks it, so
  it joins `codingSince` and the badge dates on the list of values that
  can't self-correct. Bradley asked for it directly
- Favorite Project = Steam's "Favorite Game" slot
- **Item Showcase is gone.** It was projects as an inventory grid with
  rarity-tiered tiles. Removed at Bradley's request, and with it the
  `#showcase-heading` anchor, `rarityStyles`/`rarityLabels`/`monogram`
  and the `rarity` colour tokens. The `rarity` field survives on each
  project, rendered by nothing — see `profile-data`
- Recent Activity = one GitHub block of compact rows, three hand-picked
  repos, each showing name, language and how long ago it was pushed. Plus
  a dashed placeholder naming the sources that aren't built. **Every
  commit count here is gone** at Bradley's request — the per-row total,
  the "commits past 2 weeks" strip, and the panel-bar sum that was the
  analogue of Steam's hours-past-2-weeks. The data layer still fetches
  them, so putting any of it back is a render change only. A CS2-style
  killfeed lived here and was removed for duplicating the repo rows
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
- Right sidebar = status heading derived from the last push, stat rows
  (Repos / Hackathon Wins / Following / Gists / Contributions, plus
  Comments and Artwork-Portfolio as em-dashes because nothing counts them
  yet), then DevEval, Tech Stack, Languages and a Links row of icons.
  **No badge tiles and no stars-ranked repo list** — both removed
- Exy = Bradley's actual dog, as a controllable character. He hides
  behind the profile photo with only his tail showing; click the tail and
  he walks out from behind it, WASD or arrows move him, clicking him
  growls and shakes, Escape puts him away. Built from three phone clips
  of the real dog. See `src/components/Exy.tsx`

**The site is live at https://www.bradleytsou.com** (Vercel, `www`
primary, apex 308-redirects to it). `siteOrigin` in `profile-data` must
match whichever domain is Primary there.

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

- `src/lib/profile-data.ts` — all editable content (name, projects,
  roles, GitHub username). `githubUsername` is set to `brad945`, so the live
  data layer is on. Projects are real now — every `blurb` is the repo's
  own GitHub description, copied verbatim so it can be checked.
  **The invented values are gone.** `badges` was deleted outright and
  `codingSince` is Bradley's real 2021-01-01, so nothing on the page is
  made up. Three figures are still hand-set and *cannot* self-correct,
  each deliberately: `profileLevel` (26, his real Steam level),
  `hackathonWins` (3 — Devpost has no public API) and `accountBalance`
  ($0.01, Steam chrome reproduced as a prop, not data).
  Also here now: `privacyScreen` (the "Coming soon" cover),
  `steamProfileUrl`, `linkedinUrl`, `repoDisplayNames` and `techStack`,
  which is derived from the `tags` on roles and projects rather than
  hand-kept.
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
- **`ContributionSummary.tsx` no longer exists.** Contributions is a
  single stat row inside `Sidebar`. A weekly bar chart lived here first;
  it showed *when* the work happened but never what it was. Fed by
  `getContributions()` in `src/lib/github.ts` — **GraphQL, so auth-only**:
  no `GITHUB_TOKEN`, no row.
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
- `src/components/ProfileHeader.tsx` — full-width identity block over the
  profile-background gradient: framed avatar, name, location, summary,
  and the right-hand Level circle + "Years of Experience" card. Level is
  computed from `profile.codingSince`, so it counts up on its own.
  **The avatar is `public/avatar.jpg`, not the GitHub one** — Bradley
  supplied the photo directly. It's the only thing in the header that
  isn't fetched, so it's the only one that can go stale silently:
  changing his GitHub picture no longer changes the page. The source was
  the **full-frame original**, cropped 600x600 at q90 — the centred
  square of a 1652x1576 photo, so it's almost the whole frame with all
  three faces. Earlier passes used a circular-cropped copy, where every
  framing choice traded scene against black corner nicks; the original
  ends that, and the crop is free. To tighten it, crop toward the right,
  which is where Bradley is.
  The nav's 24px chip is **still** the GitHub avatar — it's the
  signed-in-as slot and links to the GitHub profile — so the two differ
  on purpose.
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
     720x717 photo) — a 1.75 ratio. On the 169px avatar that's an 18 / 10
     band, which with the 1px bevel means `px-[17px] py-[9px]`. Both are
     percentages of the photo, so a resize means recomputing them. Equal
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
  Here that's 69x39 (40.8%), rounded to the nearest size whose travel
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
  are hard-coded against the avatar's 167px padding box and the 69x39
  logo — **resize one and you must resize the other**. The bounce runs on `steps(15, jump-none)` /
  `steps(17, jump-none)`, i.e. duration x 10, which pins it to the original
  screensaver's chunky 10fps; change a duration and you must change its
  step count to hold that framerate. Keep durations at whole tenths so
  the step count stays an integer, and keep the two sharing no common
  factor or the path visibly loops. **Travel must divide evenly by its
  step count** (98/14 = 7px, 128/16 = 8px) — a fractional step lands the
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
  **It also hosts Exy's two slots**, `#exy-den` (his tail, left edge) and
  `#exy-emerge` (where he walks out, right edge). Both are empty anchors;
  `Exy.tsx` portals into them, so this file owns only *where* he hides.
  Both must stay **before** the frame in DOM order — later siblings paint
  on top, and that's what puts the photo over him. The avatar block
  carries `z-10` so he passes in front of the bio text, and `self-start`
  so the den's `top-%` resolves against the photo rather than the
  stretched flex row.
  The header must **not** get `overflow-hidden` — it would clip the alias
  dropdown. The gradient overlay is `absolute inset-0`, so nothing spills.
- `src/components/SiteNav.tsx` — Steam's global header: dark full-width bar
  (`chrome` #171a21), wordmark left, uppercase nav items beside it,
  signed-in user + avatar right. Uppercase with tracking is wrong nearly
  everywhere else here but it's exactly what Steam's nav does, so it
  stays.
  **The wordmark is the `bt.` mark, not text** — `BtMark`, at 50x36. It
  links to `/#top`, not `/#profile`: the nav isn't sticky, so `#profile`
  already sits ~120px down and `scroll-padding-top: 64px` parked it 64px
  from the edge, scrolling the page down ~56px on every click and eating
  half the nav. `top` is a fragment the HTML spec resolves to the document
  top with no element to point at. On hover each glyph hops in turn, 110ms
  apart, once per hover — see `glyph-hop` in the Tailwind config, and note
  the transform units there are viewBox units, not pixels.
  Nav items are **Profile / About / Chat / Play / Resume**. Only Profile
  (`/#profile`) and Play (`/play`) are links; the rest render as dim,
  non-clickable text, because an `href="#"` that silently does nothing is
  worse than something visibly unfinished. Giving an entry an href is the
  whole change when its section lands. Targets are written root-relative
  so they also work from `/play`.
  Right side: the GitHub login, the `$0.01` balance under it, and the
  avatar, all inside one `HoverNote` reading "pulled live from cashapp
  api" — **a joke, not a description**; there is no Cash App call in this
  repo.
  `scroll-behavior: smooth` plus `scroll-padding-top: 64px` on `html`
  eases to sections; both are disabled under `prefers-reduced-motion`.
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
  (`github.com/:login.atom` — the raw event feed). Closes on
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
  `aliases` in `src/lib/profile-data.ts` — brad945 / bradoom /
  bradleytsou / bt, real handles rather than the old placeholders.
- `src/components/ItemShowcase.tsx` — **exports only `FavoriteProject`
  now**; the inventory grid that was the default export is deleted.
  `FavoriteProject`
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
- `src/components/ActivityFeed.tsx` — Steam's Recent Activity panel,
  restructured as **one labelled GitHub source block** plus a dashed
  `PlannedSources` placeholder naming what isn't built (Spotify, YouTube,
  videogame, books — and which of those have APIs and which would be
  hand-kept, because that distinction is the site's whole premise). Rows
  are single-line: name on the left, language and relative push time on
  the right. `MAX_ROWS` is 3, sliced here rather than trimmed out of
  `featuredRepos`, which also feeds the Experience rows. Private repos
  get a Private tag instead of a link. **All commit counts were removed**
  at Bradley's request, including the panel-bar total; `myCommits` and
  `myCommitsPast2Weeks` are still fetched, so restoring any of it is a
  render change. `PublicRepoRow` is the no-token fallback.
- `src/components/Sidebar.tsx` — the right column, in order: a status
  heading derived from the last push (Currently Online / Recently Active /
  Currently Offline, thresholded on hours, linked to the GitHub profile
  because that's the thing being measured), then stat rows — Repos,
  Hackathon Wins, Following, Gists, Contributions, Comments, Artwork /
  Portfolio. Then DevEval, Tech Stack, Languages, Links.
  **Zero-value rows hide themselves**, and the check is live, so each
  returns on its own once the number moves. Comments and Artwork show an
  em-dash rather than 0: nothing counts them, and "0" would claim it had
  been counted.
  **Gone from here:** followers, badge tiles, the focus list, the
  stars-ranked Top Repositories list, the language bars (see "No
  decorative meters") and the LinkedIn follower count.
  Tech Stack is derived from the `tags` on roles and projects minus
  `NON_STACK_TAGS`, plus `EVIDENCED_STACK` — so nothing can appear there
  that isn't attached to real work elsewhere on the page. Links is a row
  of icons; an entry with no `href` renders greyed and unlinked rather
  than pointing somewhere invented.
- `src/components/AutoRefresh.tsx` — tiny client component that calls
  `router.refresh()` on the revalidate interval so the feed actually
  ticks over for someone leaving the tab open (ISR only revalidates on a
  new request; this supplies the request). Pauses while the tab is hidden.
- `src/components/Comments.tsx` — built but NOT wired into the page yet.
  Uses giscus (GitHub Discussions-backed, not a fake widget). **Blocked on
  the repo being public** — giscus requires it, and as of now
  `brad945/bradleytsou-site` is private with Discussions disabled. Then:
  enable Discussions, install the giscus app, paste `data-repo-id` and
  `data-category-id` into `GISCUS`, uncomment two lines in `page.tsx`.
  Making the repo public also lights up "View source" in the ⋯ menu by
  itself.
- `src/components/Exy.tsx` — Bradley's dog as a controllable character,
  and the biggest thing here. Asleep he's portalled into `#exy-den`
  behind the avatar with only his tail out; clicking it plays a growl and
  starts an `emerging` phase parented to `#exy-emerge` on the photo's
  other edge, where CSS walks him out from behind it before handing off
  to the free-walking layer. Then WASD **or arrows** move him, clicking
  him growls and shakes, Escape puts him away (clicking no longer does).
  Load-bearing details, all with their reasoning in the file: speeds are
  per-axis and multiplied by his scale; he grows walking down and shrinks
  walking up, but only when the vertical key is held alone; the side
  frame rate is *derived* from speed so his feet don't slide; he's drawn
  twice a viewport apart so the horizontal wrap is seamless; vertical
  clamps rather than wraps.
  Frames were cut from three phone clips with ffmpeg + rembg — see
  `public/exy/README.md`, which records the pipeline and the two things
  still missing (a back cycle, and a real bark; `growl.mp3` stands in).
- `src/components/BtMark.tsx` — the `bt.` mark as vector primitives,
  shared by the favicon and the nav. viewBox is the mark's exact ink
  bounds (408x292), and the b's counter is a real hole done by winding.
  Passing `glyphClassName` wraps each glyph in its own `<g>` for
  animating; **omitting it leaves the markup ungrouped, and that path is
  the one Satori renders** — Satori cannot handle React Fragments, so the
  component has two whole returns rather than shared structure.
- `src/components/AnimatedFavicon.tsx` — swaps the static `/icon` for a
  four-frame stepped hop after hydration. Whole-pixel offsets on purpose:
  sub-pixel positions blur at 16px, and browsers coalesce favicon writes,
  so raising the frame rate does nothing. Chrome repaints tab icons about
  once a second, which is the hard ceiling on this.
- `src/components/HoverNote.tsx` — an instant hover note, because native
  `title` has a ~1s delay nothing can shorten. `w-max` and the *named*
  group are both load-bearing; see the file.
- `src/components/BoardedUp.tsx` — the "Coming soon" cover, rendered
  **instead of** the profile grid when `privacyScreen` is on. An overlay
  was tried and couldn't hold: covering pixels doesn't disable a document.
- `src/components/SocialIcons.tsx` — the Links row marks, drawn as paths
  rather than pulled from an icon package.
- `src/app/play/page.tsx` — `/play`, deliberately near-empty. It exists so
  the nav's Play item can be a real link. It fetches the snapshot for one
  reason: `SiteNav` hides its whole right-hand block when `stats` is null,
  so without it the nav there would be visibly shorter.
- `src/app/icon.tsx`, `opengraph-image.tsx` — the favicon and the 1200x630
  share card, both generated at build time from `profile-data` rather than
  checked in as binaries.
- `src/app/robots.ts`, `sitemap.ts` — allow-all plus the sitemap, and two
  URLs. `lastModified` is deliberately omitted: content changes when
  Bradley commits, not when Vercel rebuilds.
- `src/app/page.tsx` — SiteNav, full-width ProfileHeader, then a
  `lg:grid-cols-[2fr_1fr]` split that stacks below `lg`. `max-w-profile`
  is **990px**, not Steam's 940 — widened 25px per side at Bradley's
  request for more text room, so the columns land at ~649 / 12 / ~325
  (the gap is Steam's 12px `.profile_customization` margin). The 2:1
  ratio is Steam's; the absolute widths are no longer. `<main>` carries
  `hero`, which is what makes it read as the centred column.

  **The grid was flattened to a single column once and put back.** "One
  column" meant the *page* — this centred `max-w-profile` block on the
  grey surround — not the main/sidebar split inside it. Don't collapse it
  again.

  Main column order: **Recent Activity, Experience, Favorite Project**.
  Contributions moved to the sidebar. Comments import is commented out on
  purpose; `<Exy />` sits outside the column, since he walks the whole
  viewport rather than the centred block.
- `src/app/layout.tsx` — fonts (next/font), metadata, `metadataBase` and
  the canonical, and the fixed starfield layer. The nebula glow went with
  the rest of the decorative gradients; the starfield is 12
  radial-gradients each painting a single 1px dot. Mounts
  `<AnimatedFavicon />`.
  **Three fonts, not two.** Open Sans (display + body), JetBrains Mono
  (`.label` chrome only), and **Gabarito** as `--font-sign`, used by
  exactly one element: the "Coming soon" line. It's a free stand-in for BB
  Casual Pro Medium, which Bradley asked for and the site cannot load —
  Bold Studio sells it per-licence and embedding needs a paid webfont
  licence, the same wall as Motiva Sans.

## Design tokens (already in tailwind.config.ts)

**Dark theme**, and the palette is Steam's own, taken from their
stylesheets — `#171d25` is `#global_header`, `#8f98a0` their body text,
`#66c0f4` their link blue, `#c7d5e0` their bright text.

**Two different Steam surfaces, don't mix them up.** `#1b2838` is `body`
in `globalv2.css` — the *community/store* page. Profile pages use
`body.profile_page { background-color: #000000 }`. So `base` (the page)
is black and `hero` (the centred column, on `<main>`) is the blue.
Painting the whole page #1b2838 was tried and reverted: with no darker
surround there is no column to see.

The panel fills are derived, not guessed: Steam paints profile cards
`rgba(0,0,0,.3)` and status blocks `rgba(0,0,0,.5)` over the page, so
`panel`/`panel2` are those composited over `#1b2838`, and `line` is their
`rgba(255,255,255,.1)` border done the same way.

**A light theme was built and reverted** (commits `41c4d3a`, `f8903e8`,
undone here). If it's ever wanted again the values were: `base` #c2c7ce,
`hero` #eaedf1, `panel` #dfe3e9, `panel2` #d2d7de, `line` #aeb6c1,
`chrome` #d9dde3, `bright` #0e1723, `ink` #1f2a36, `copy` #3b4856,
`muted` #616b76, `accent` #945e09, `live` #12784a, `link` #0f5f96, and
the starfield dots as `rgba(30,45,66,…)`.

**The bio lines are white now**, so the theme-swap legibility problem the
accents used to have is moot while they stay unused.

- `base` #000000 (page), `hero` #1b2838 (the centred column)
- `panel` #131c27, `panel2` #0e141c, `line` #323e4c
- Text ramp: `bright` #ffffff (headings), `ink` #e5e8ea, `copy` #c7d5e0
  (body), `muted` #8f98a0
- `accent` #de9b35, `live` #5cc98f, `link` #66c0f4
- `chrome` #171a21 (global header), `teal` #2a475e (panel bars)
- `steel` #8e9199 (avatar frame band), `menu` #464c58 (alias dropdown)
- **Bio-line accents, on the org links only**: `berkeley` #dca009,
  `medimpact` #b771f4, `deveval` #60ebdb. The bio sentences are `bright`
  white and each org **link** carries its colour, so the hue marks the word
  it belongs to instead of tinting a whole line. They've been on the full
  sentence and off entirely before this; the config comment carries the
  reasoning behind the values.
  Three things worth not relearning if they return: gold is the one brand
  colour usable raw here (Berkeley Blue #003262 is 1.16:1 on this column,
  MedImpact's #250644 is 1.18:1 — both had to be tints); MedImpact is the
  contrast risk at 5.59:1, and L=66 fails outright; and "more teal" means
  more saturated and slightly darker, **not bluer** — 180 is cyan. The
  trap is re-harmonising all three to a shared saturation, which is what
  read as highlighters at 60/65/76%.
- Fonts: Open Sans (display + body), JetBrains Mono (`.label` chrome
  only), Gabarito (`font-sign`, the "Coming soon" line and nothing else)

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
  used for chrome labels. Tracked uppercase is the single most un-Steam
  thing you can add
- **pure white for headings, blue-grey for copy** — not one flat colour
- **tight leading on headings, ~1.5 on body**

Measured against Steam and matched: the global header is **104px**
(`#global_header .content`), panels carry a **3px** radius
(`.profile_customization`) and sit **12px** apart (its `margin-bottom`).
The profile header's 230px is already within 6px of Steam's 224px
`min-height`.

One place we deliberately differ: our panel bar is 46px where Steam's
`.profile_customization_header` computes to 40 (5px padding + 30px
line-height). Bradley asked for bigger, so it stays bigger.

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

**The rarity tokens are gone**, along with `nebula`, `plum` and `wine`.
The first three fed only the deleted Item Showcase; `plum` and `wine` were
never referenced at all, shadowed by `teal` and `chrome`. If tiers ever
come back they were `accent` / `nebula #417a9b` / `muted`.

Class strings built by concatenation are still the trap that made those
written out in full — **Tailwind's scanner reads source as text**, so it
can't see a name assembled at runtime. It also reads *comments*: writing
an arbitrary-value class inside one emits it as a real, dead rule. That
has happened twice.

## Explicitly NOT built yet — do these next, in this order

**Exy is done** and is no longer on this list.

1. **Wire up Comments.tsx.** The code is finished; the blocker is that
   giscus needs a public repo and this one is private with Discussions
   off. That's Bradley's call, not a code task.
2. **Bhop/strafe-timing canvas** as an entry gate before the page reveals.
   Real skill-based mechanic (WASD + jump timing / simple physics), not a
   decorative loading animation. Should have a skip option — don't hard-gate
   the site behind it. `/play` exists and is empty, so it has a home now.
3. **Radar-style "about me" map** — a custom map-like layout (doesn't need
   to be a literal CS2 map, can be styled abstractly) where pins are skill
   categories. Clicking a pin opens a loadout-card style panel. Note it was
   going to reuse the Item Showcase's rarity visual language, and that is
   deleted — the `rarity` field on each project survives as its input.

### Waiting on Bradley, not on code

- A **Discord URL** (last greyed icon in the Links row) and a **resume
  PDF** in `public/` (the nav item lights up on its own once its href is
  filled in).
- **Bio copy.** The `Bio` heading is on the page with nothing under it,
  and it's also what would let the About nav item become a real link.
- **Exy's back cycle and a real bark** — see `public/exy/README.md`.

## Deployment — already done

**Live at https://www.bradleytsou.com**, on Vercel, from
`brad945/bradleytsou-site` (private). `www` is Primary and the apex
308-redirects to it; `siteOrigin` in `profile-data` is hardcoded to match
and **must be changed if that's ever flipped**, or every canonical points
at a URL that redirects.

`npm run dev` serves on **port 3003**, not 3000.

`GITHUB_TOKEN` needs to be set in Vercel's environment variables, not
just locally — without it the status line, contributions, languages and
every featured-repo row degrade to their empty states.

**The "Coming soon" cover is `privacyScreen` in `profile-data`, and it is
currently `false` on this branch.** Pushing takes the cover down. That is
a one-word edit either way, but it isn't obvious from a diff summary, so
check it before pushing.

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
  A third was added and removed within the hour — `cal-swap`, the tagline
  cycling Berkeley Blue to California Gold. It was the only one that was
  decoration rather than a real feature, and it went.
  **Three more have since been added, all at Bradley's explicit request
  after the rule was put to him:** Exy's tail wagging where it pokes out
  from behind the photo (idle slow, faster on hover), the `bt.` mark's
  per-glyph hop on hover, and Exy's shake when clicked. All are
  `motion-safe`. The rule still stands — don't read these as licence.
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
