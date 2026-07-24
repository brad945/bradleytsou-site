"use client";

import { useEffect, useRef, useState } from "react";

interface NameHistoryProps {
  name: string;
  /** Previous handles, most recent first. */
  aliases: string[];
}

/**
 * Steam's persona name with the caret beside it that opens the alias history.
 * Real behaviour, placeholder content — see `aliases` in lib/profile-data.ts.
 *
 * "Clear previous aliases" does what it says: it empties the list for this
 * session, the same as Steam's. It's client-side only, so a reload restores
 * it — no fake button that does nothing.
 */
export default function NameHistory({ name, aliases }: NameHistoryProps) {
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const visible = cleared ? [] : aliases;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Send focus back to the caret rather than dropping it on <body>.
      trigger.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative inline-flex items-center gap-2">
      <h1 className="text-[28px] font-light leading-tight text-ink">{name}</h1>

      {/*
        The dropdown anchors to the caret, not to the name: in the reference
        the box's top-left sits directly under the arrow. That means this span
        — not the outer wrapper — has to be the containing block.
      */}
      <span className="relative flex items-center">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={open ? "Hide previous aliases" : "Show previous aliases"}
          className="flex h-5 w-5 items-center justify-center text-ink/70 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {/* Drawn rather than typed — the ▾ glyph renders inconsistently small. */}
          <svg
            width="11"
            height="7"
            viewBox="0 0 11 7"
            className={open ? "rotate-180" : undefined}
            aria-hidden
          >
            <path d="M0.5 0.5h10L5.5 6.5z" fill="currentColor" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 mt-1 w-[250px] bg-menu shadow-[0_4px_14px_rgba(0,0,0,0.55)]">
            <p className="px-4 pb-1 pt-3 text-[15px] text-ink">
              This user has also played as:
            </p>

            {visible.length > 0 ? (
              <ul className="py-1">
                {visible.map((alias) => (
                  <li key={alias} className="px-4 py-[7px] text-[15px] text-ink/90">
                    {alias}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-[14px] text-ink/50">No previous aliases</p>
            )}

            {visible.length > 0 && (
              <div className="flex justify-end px-4 pb-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCleared(true)}
                  className="text-[13px] text-ink/60 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Clear previous aliases
                </button>
              </div>
            )}
          </div>
        )}
      </span>
    </div>
  );
}
