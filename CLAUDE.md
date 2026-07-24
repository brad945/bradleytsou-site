# Project context for Claude Code

This file is read automatically by Claude Code when you open this folder.
It's a handoff from a chat session where the design and initial scaffold
were built — everything below is context so you don't have to re-explain it.

## What this is

Bradley's personal site, deliberately NOT a generic hover/scroll-animation
portfolio. It's structured like a Steam profile page, but every stat on it
is real, not decorative:
- Profile header = real "about me" info (years coding, current focus,
  badges tied to actual milestones), not game stats
- Item Showcase = real projects styled like an inventory grid, rarity tier
  = how central the project is to his work
- Recent Activity = a live killfeed of his actual GitHub activity (commits,
  merged PRs, new repos), styled like a CS2 kill feed, refreshing every 5 min
- Live metrics strip (public repos / followers / events per 2 weeks) sits
  where Steam shows "X hours past 2 weeks"

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
  GitHub username). **Bradley still needs to fill in his real GitHub
  username and real project links here** — placeholders are in as
  `your-github-username` (exported as `PLACEHOLDER_GITHUB_USERNAME`).
  `githubUsername` carries an explicit `: string` annotation — without it
  TypeScript infers the literal type and the placeholder comparisons
  elsewhere become "no overlap" build errors the moment it's edited.
  Until it's set the page prerenders fully static with the feed's empty
  state; once it's real the fetch appears and the route becomes ISR.
- `lib/github.ts` — fetches GitHub events + user stats, computes the
  2-week activity count. Never throws: bad username, rate limit, or a
  network failure all degrade to an empty snapshot with an `error` string,
  so a placeholder username can't break the build or 500 the page.
  Reads `GITHUB_TOKEN` from the environment if present (raises the rate
  limit from 60/hr/IP to 5000/hr) but works fine without one.
- `components/ProfileHeader.tsx` — avatar, name, status dot, badges,
  level/XP bar card. Level is computed from `profile.codingSince`, so it
  counts up on its own.
- `components/ItemShowcase.tsx` — project grid styled like Steam's item
  showcase, colored left-border by "rarity."
- `components/ActivityFeed.tsx` — the killfeed + live metrics strip.
- `components/AutoRefresh.tsx` — tiny client component that calls
  `router.refresh()` on the revalidate interval so the killfeed actually
  ticks over for someone leaving the tab open (ISR only revalidates on a
  new request; this supplies the request). Pauses while the tab is hidden.
- `components/Comments.tsx` — built but NOT wired into the page yet
  (deliberately parked). Uses giscus (GitHub Discussions-backed comments,
  not a fake widget). Needs `data-repo-id` / `data-category-id` from
  giscus.app once Discussions are enabled on the repo.
- `app/page.tsx` — assembles ProfileHeader + ItemShowcase + ActivityFeed.
  Comments import is commented out on purpose.
- `app/layout.tsx` — fonts (next/font), metadata, and the static nebula
  background gradient.

## Design tokens (already in tailwind.config.ts)

Dark theme, not a generic AI-slop palette:
- `base` #0c0d11, `panel` #15171e, `panel2` #1c1f29, `line` #2a2d3a
- `ink` #e9e7e2 (text), `muted` #8b90a0
- `accent` #de9b35 (CS2-orange, used sparingly)
- `nebula` #5b3fae (background glow / gradient accent)
- `live` #5cc98f (online status / success)
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (stats/labels)

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
  data or a real mechanic, per Bradley's explicit brief.
- Don't reproduce Valve/Steam's actual logo or trademarked chrome — this is
  "inspired by the structure of," not a literal skin of the Steam UI.
- Don't hardcode colors outside the token system in `tailwind.config.ts`.
