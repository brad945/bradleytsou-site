"use client";

import { useEffect, useRef, useState } from "react";

interface HeaderActionsProps {
  /** GitHub profile URL, or null when the username isn't configured. */
  profileUrl: string | null;
  /** GitHub login, used to build the API and feed URLs. */
  login: string | null;
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
 * chrome this site avoids. Every item here is a working link.
 */
export default function HeaderActions({ profileUrl, login, email }: HeaderActionsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
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

  // Reset the copy confirmation so the menu doesn't reopen still saying "Copied".
  useEffect(() => {
    if (copied === "idle") return;
    const id = window.setTimeout(() => setCopied("idle"), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  /**
   * The async Clipboard API needs a secure context AND a focused document, so
   * it throws NotAllowedError in cases a user can genuinely hit (window not
   * focused, older Safari). Fall back to the execCommand trick rather than
   * telling them it failed.
   */
  async function copyLink() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied("done");
      return;
    } catch {
      // fall through
    }

    try {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      setCopied(ok ? "done" : "failed");
    } catch {
      setCopied("failed");
    }
  }

  const menuItem =
    "block w-full px-4 py-[7px] text-left text-[14px] text-copy transition-colors hover:bg-ink/10 hover:text-bright focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-accent";

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
          <button type="button" onClick={copyLink} className={menuItem}>
            {copied === "done"
              ? "Copied"
              : copied === "failed"
                ? "Copy failed"
                : "Copy profile link"}
          </button>

          {login && (
            <>
              {/* The JSON this page is actually built from. */}
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
