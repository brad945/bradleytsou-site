"use client";

import { useEffect, useRef, useState } from "react";

interface HeaderActionsProps {
  /** GitHub profile URL, or null when the username isn't configured. */
  profileUrl: string | null;
  /** GitHub login, used to build the API and feed URLs. */
  login: string | null;
  /**
   * This site's own repo — null when it isn't publicly visible, in which case
   * the row is omitted rather than linking somewhere a visitor gets a 404.
   */
  sourceUrl: string | null;
  email: string;
}

/**
 * Steam's profile action row. On someone else's profile Steam shows
 * Add Friend / Message / ⋯, and since every visitor here is "someone else"
 * that's the set we mirror — Follow / Message / ⋯.
 *
 * The ⋯ menu deliberately doesn't ape Steam's contents (Add to favorites,
 * Block all communication, Report violation) because none of those have a
 * real equivalent, and a menu of dead entries is exactly the kind of fake
 * chrome this site avoids.
 *
 * All three items point at the machinery behind the page. A "copy profile
 * link" entry lived here briefly and was cut: Steam needs one because its
 * profile URLs are long numeric strings, but this is a single page whose URL
 * is already in the address bar, so it was filling a slot rather than earning
 * one.
 */
export default function HeaderActions({
  profileUrl,
  login,
  sourceUrl,
  email,
}: HeaderActionsProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuItem =
    "block px-4 py-[7px] text-left text-[14px] text-copy transition-colors hover:bg-ink/10 hover:text-bright focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-accent";

  return (
    <div ref={root} className="relative flex flex-wrap items-center gap-2">
      {profileUrl && (
        <a href={profileUrl} target="_blank" rel="noreferrer" className="steam-button">
          Follow
        </a>
      )}

      <a href={`mailto:${email}`} className="steam-button">
        Message
      </a>

      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Hide more actions" : "More actions"}
        className="steam-button px-3 leading-none"
      >
        <span aria-hidden>⋯</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-[220px] bg-menu py-1 shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
          {/* How the page is built. Hidden while the repo is private. */}
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className={menuItem}>
              View source
            </a>
          )}

          {login && (
            <>
              {/* The JSON the page is built from. */}
              <a
                href={`https://api.github.com/users/${login}`}
                target="_blank"
                rel="noreferrer"
                className={menuItem}
              >
                View raw API response
              </a>
              {/* GitHub's real Atom feed — the same events as the killfeed. */}
              <a
                href={`https://github.com/${login}.atom`}
                target="_blank"
                rel="noreferrer"
                className={menuItem}
              >
                Activity feed (.atom)
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
