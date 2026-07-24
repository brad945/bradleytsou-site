"use client";

import { useEffect, useRef, useState } from "react";

interface NameHistoryProps {
  name: string;
  /** Previous handles, most recent first. */
  aliases: string[];
}

/**
 * Steam's persona name with the caret beside it that opens the name-history
 * dropdown. Real behaviour, placeholder content — see `aliases` in
 * lib/profile-data.ts.
 */
export default function NameHistory({ name, aliases }: NameHistoryProps) {
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

      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={open ? "Hide previous aliases" : "Show previous aliases"}
        className="flex h-5 w-5 items-center justify-center text-[10px] text-ink/60 transition-colors hover:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className={open ? "rotate-180" : undefined} aria-hidden>
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[230px] border border-line bg-panel2 shadow-panel">
          <p className="border-b border-line px-3 py-2 text-[13px] text-muted">
            Previous aliases
          </p>
          {aliases.length > 0 ? (
            <ul className="py-1">
              {aliases.map((alias) => (
                <li key={alias} className="px-3 py-1 text-[14px] text-ink/85">
                  {alias}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-[13px] text-muted/70">No previous aliases</p>
          )}
        </div>
      )}
    </div>
  );
}
