"use client";

import { useEffect, useRef, useState } from "react";

interface HeaderActionsProps {
  /** GitHub profile URL, or null when the username isn't configured. */
  profileUrl: string | null;
  /**
   * This site's own repo — null when it isn't publicly visible, in which case
   * the row is omitted rather than linking somewhere a visitor gets a 404.
   */
  sourceUrl: string | null;
  email: string;
}

/**
 * Steam's profile action row, pared down to Message / More. Follow sits inside
 * the menu rather than on the row: mailing Bradley is the action a visitor is
 * actually likely to want, and three top-level buttons made none of them read
 * as primary.
 *
 * The menu deliberately doesn't ape Steam's contents (Add to favorites, Block
 * all communication, Report violation) because none of those have a real
 * equivalent, and a menu of dead entries is exactly the kind of fake chrome
 * this site avoids. Every item is a working link.
 *
 * A "Copy profile link" entry lived here briefly and was cut: Steam needs one
 * because its profile URLs are long numeric strings, but this is a single page
 * whose URL is already in the address bar, so it filled a slot rather than
 * earning one.
 */
export default function HeaderActions({
  profileUrl,
  sourceUrl,
  email,
}: HeaderActionsProps) {
  const [open, setOpen] = useState(false);
  // Scoped to the button + menu, so clicking Message alongside it also closes.
  const root = useRef<HTMLSpanElement>(null);
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
    <div className="flex flex-wrap items-center gap-2">
      <a href={`mailto:${email}`} className="steam-button">
        Message
      </a>

      {/* The menu anchors to this span, not the whole row. More is the
          rightmost control, so the panel is right-aligned to it and grows
          leftward — left-aligned it would overhang the column. */}
      <span ref={root} className="relative flex items-center">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-haspopup="true"
          className="steam-button gap-1.5"
        >
          More
          <span aria-hidden>⋯</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-20 mt-1 w-[220px] bg-menu py-1 shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noreferrer" className={menuItem}>
                Follow on GitHub
              </a>
            )}

            {/* How the page is built. Hidden while the repo is private. */}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noreferrer" className={menuItem}>
                View source
              </a>
            )}
          </div>
        )}
      </span>
    </div>
  );
}
