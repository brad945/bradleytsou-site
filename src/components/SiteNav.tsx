import Image from "next/image";
import type { GitHubStats } from "@/lib/github";
import { profile } from "@/lib/profile-data";
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

export default function SiteNav({
  stats,
  privacyScreen = false,
}: {
  stats: GitHubStats | null;
  /** Drops the nav items whose sections are behind the boards. */
  privacyScreen?: boolean;
}) {
  /*
   * Experience and Activity are removed rather than disabled while the privacy
   * screen is up. Their headings aren't rendered, so those hrefs would be
   * anchors to ids that don't exist — they'd silently do nothing on click,
   * which is precisely the dead-tab chrome this nav exists not to be.
   */
  const links = privacyScreen
    ? LINKS.filter((link) => link.href === "#profile")
    : LINKS;

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

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[12px] uppercase tracking-[0.08em] text-copy/70 transition-colors hover:text-bright"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {stats && (
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-2 text-[13px] text-copy/70 transition-colors hover:text-bright"
          >
            <span>{stats.login}</span>
            {stats.avatarUrl && (
              <Image
                src={stats.avatarUrl}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-cover"
                unoptimized
              />
            )}
          </a>
        )}
      </div>
    </nav>
  );
}
