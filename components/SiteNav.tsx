import Image from "next/image";
import type { GitHubStats } from "@/lib/github";
import { profile } from "@/lib/profile-data";

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
  { label: "Projects", href: "#showcase-heading" },
];

export default function SiteNav({ stats }: { stats: GitHubStats | null }) {
  const handle = profile.handle.replace("@", "");

  return (
    <nav className="bg-chrome">
      <div className="mx-auto flex max-w-profile flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <a
          href="#profile"
          className="text-[19px] font-light leading-none tracking-tight text-bright"
        >
          {handle}
        </a>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
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
