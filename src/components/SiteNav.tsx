import Image from "next/image";
import type { GitHubStats } from "@/lib/github";
import { accountBalance, profile } from "@/lib/profile-data";
import BtMark from "@/components/BtMark";

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
const LINKS = [
  { label: "Profile", href: "#profile" },
  { label: "Experience", href: "#experience-heading" },
  { label: "Activity", href: "#activity-heading" },
];

/**
 * Placeholders, at Bradley's request — sections that don't exist yet.
 *
 * Rendered as plain text, **not as anchors**. A nav of hrefs going nowhere is
 * the fake chrome this site exists not to be, and an `href="#"` that silently
 * does nothing on click is worse than something that visibly isn't ready. They
 * sit dimmer than the real items and carry a `title` saying so.
 *
 * Move an entry into `LINKS` with a real href the day its section lands.
 */
const PLACEHOLDER_LINKS = ["Chat", "Socials", "Games", "Misc"];

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
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[12px] uppercase tracking-[0.08em] text-copy/70 transition-colors hover:text-bright"
              >
                {link.label}
              </a>
            </li>
          ))}

          {/* Not anchors — see PLACEHOLDER_LINKS. */}
          {PLACEHOLDER_LINKS.map((label) => (
            <li key={label}>
              <span
                title={`${label} — coming soon`}
                className="cursor-default text-[12px] uppercase tracking-[0.08em] text-copy/30"
              >
                {label}
              </span>
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
              */}
              <span className="text-[12px] text-muted">{accountBalance}</span>
            </span>

            {stats.avatarUrl && (
              <Image
                src={stats.avatarUrl}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 shrink-0 object-cover"
                unoptimized
              />
            )}
          </a>
        )}
      </div>
    </nav>
  );
}
