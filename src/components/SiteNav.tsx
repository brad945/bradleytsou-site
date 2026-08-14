import Image from "next/image";
import type { GitHubStats } from "@/lib/github";
import { accountBalance, profile } from "@/lib/profile-data";
import BtMark from "@/components/BtMark";
import HoverNote from "@/components/HoverNote";

/**
 * Steam's global header: dark full-width bar, wordmark on the left, uppercase
 * nav items beside it, signed-in user on the right.
 *
 * Uppercase with tracking is wrong nearly everywhere else on this site, but
 * it's exactly what Steam's nav does, so it stays here.
 *
 * The links are real in-page anchors rather than dead tabs — this is one page,
 * and a nav of hrefs that go nowhere is the fake chrome the site avoids.
 * They target the section headings, so they break if those ids are renamed.
 */
/**
 * One ordered list rather than links-then-placeholders, so position and
 * readiness are independent: "About" is a placeholder but belongs second, next
 * to Profile, not shunted to the end with the others.
 *
 * An entry **without** `href` renders as dim plain text, not an anchor. A nav
 * of hrefs going nowhere is the fake chrome this site exists not to be, and an
 * `href="#"` that silently does nothing on click is worse than something that
 * visibly isn't ready — those carry a `title` saying so.
 *
 * Giving an entry an href is the whole change when its section lands.
 */
const NAV_ITEMS: { label: string; href?: string }[] = [
  { label: "Profile", href: "#profile" },
  /*
   * No href on purpose. The obvious one is `#profile`, but Profile already
   * points there — two items scrolling to the same place is worse than one
   * that visibly isn't built. Point it at an About section's heading id when
   * there is one.
   */
  { label: "About" },
  { label: "Chat" },
  { label: "Play" },
  /*
   * Also no href. There's no resume file in `public/` and no hosted copy to
   * point at — a nav item linking to a 404 is worse than one that's visibly
   * not ready. Drop a PDF in `public/` and give this its path.
   */
  { label: "Resume" },
];

/*
 * Experience and Activity were dropped here at Bradley's request, so the two
 * in-page section anchors are gone and Profile is the only live link left.
 * Their headings (`#experience-heading`, `#activity-heading`) still exist on
 * the page, so restoring either is just re-adding the entry.
 */

export default function SiteNav({ stats }: { stats: GitHubStats | null }) {
  return (
    <nav className="bg-chrome">
      {/*
        104px is Steam's own `#global_header .content` height — ours was 48,
        under half of it, which is most of why the top of the page didn't read
        as Steam. The wordmark is scaled to suit and the nav items sit on the
        baseline rather than centred, as they do there.
      */}
      <div className="mx-auto flex h-[104px] max-w-profile flex-wrap items-center gap-x-7 gap-y-2 px-4">
        {/*
          The mark, where the handle used to be set as text. Steam's slot here
          is a logo, not a name — the name is already the persona heading a few
          hundred pixels below, so spelling it twice was the redundancy.

          28px tall is matched to what it replaced: the old 26px text stood
          about 24px from the b's ascender to the y's descender, and a mark
          wants to sit a shade above the type it stands in for rather than
          level with it. Width follows from the mark's own 1.4:1.

          The svg is aria-hidden, so the link takes its accessible name from
          the label — without it this is an anchor with no text at all.
        */}
        <a
          href="#profile"
          aria-label={`${profile.name} — back to top`}
          className="text-bright transition-opacity hover:opacity-80"
        >
          {/* `block` so the svg doesn't sit on a text baseline — inline it
              would carry the line-box's descender space and ride high of the
              nav items it's meant to be centred against. */}
          <BtMark width={39} height={28} className="block" />
        </a>

        {/*
          `flex-1` + `justify-center` puts the items in the middle of the bar
          rather than packed against the mark. The mark and the user block sit
          either side at their natural widths, so the centre is the centre of
          the leftover space, not of the bar — close enough at these widths,
          and it doesn't need the absolute positioning that true centring would
          (which would let the items slide under the user block when narrow).
        */}
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-[12px] uppercase tracking-[0.08em] text-copy/70 transition-colors hover:text-bright"
                >
                  {item.label}
                </a>
              ) : (
                /* Not an anchor — see NAV_ITEMS. */
                <span
                  title={`${item.label} — coming soon`}
                  className="cursor-default text-[12px] uppercase tracking-[0.08em] text-copy/30"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>

        {stats && (
          /*
            Two rows: the profile link, then the balance under it. Steam puts
            the account balance exactly here, directly beneath the persona name
            in the global header.

            `items-end` right-aligns both against the bar's right edge, and the
            pair is centred as a block — which is what lifts the login and
            avatar off the middle line, as Bradley asked, without nudging them
            with a margin that would have to be retuned if the balance moved.
          */
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2"
          >
            {/*
              The login and the balance stack in their own column, with the
              avatar beside the pair rather than above it — so the balance sits
              under the *name*, and the avatar spans both lines. That's Steam's
              arrangement, and it's why this can't just be a flex-col around
              the whole link.
            */}
            <span className="flex flex-col items-end leading-tight">
              <span className="text-[13px] text-copy/70 transition-colors group-hover:text-bright">
                {stats.login}
              </span>
              {/*
                Hardcoded, and the only figure on this page that is. Everything
                else is fetched — there's no account here to have a balance, so
                this is Steam's chrome reproduced rather than data. Kept in
                profile-data with that noted, so it reads as a deliberate prop
                and not a number someone forgot to wire up.

                Grey rather than link-blue: it isn't a link, and colouring it
                like one implied a wallet page to click through to.

                **The hover text is a joke, not a description.** It says
                "pulled live from cashapp api"; the value is the hardcoded
                constant right there in profile-data, and there is no Cash App
                call anywhere in this repo. Bradley asked for it deliberately.
                Worth knowing before anyone reads it as a lead and goes looking
                for the integration.
              */}
              <HoverNote note="pulled live from cashapp api">
                <span className="text-[12px] text-muted">{accountBalance}</span>
              </HoverNote>
            </span>

            {/*
              32px, up from 24. It now has two lines of text beside it — the
              login and the balance — and at 24 it was shorter than the pair it
              sits against, which read as undersized rather than compact.
              Requested at 40 in `width`/`height` so it stays sharp at 2x.
            */}
            {stats.avatarUrl && (
              <Image
                src={stats.avatarUrl}
                alt=""
                width={64}
                height={64}
                className="h-8 w-8 shrink-0 object-cover"
                unoptimized
              />
            )}
          </a>
        )}
      </div>
    </nav>
  );
}
