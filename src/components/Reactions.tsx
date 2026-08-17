"use client";

import { useCallback, useEffect, useState } from "react";
import { REACTIONS, type ReactionCounts } from "@/lib/reactions";

/**
 * Emoji reactions that cost a visitor nothing — no account, no sign-in.
 *
 * The counts are **real and shared**: they live in a Redis behind
 * `/api/reactions`, so the total is everyone's, not the viewer's. That
 * distinction is the whole reason this needed a store at all. A number kept in
 * `localStorage` and labelled "total" would be a fabricated figure on a page
 * whose premise is that every number is fetched and checkable — the same rule
 * that removed the decorative meters.
 *
 * ## It hides rather than showing a zero
 *
 * Fetched client-side, and **the panel renders nothing until it has real
 * counts.** No store configured, endpoint down, request failed — all render
 * nothing at all, same as the DevEval block. A zero would be a claim that
 * counting happened and nobody reacted; absent is the truth when there was
 * nothing to read.
 *
 * That also means it costs a static page nothing: the markup only appears once
 * a real response lands.
 *
 * ## What localStorage *is* used for
 *
 * Remembering which ones **you** already pressed, so the button reads as spent
 * and doesn't invite a second press. That's UI state about this browser, which
 * is exactly what localStorage is honest for. It is not the count, and it is
 * not a limit — clearing it lets you press again, and the server's per-IP
 * ceiling is the thing that actually bounds abuse.
 */

const SEEN_KEY = "exy:reacted";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    // Private mode, disabled storage, or a corrupt value: no memory, still works.
    return [];
  }
}

export default function Reactions() {
  const [counts, setCounts] = useState<ReactionCounts | null>(null);
  const [mine, setMine] = useState<string[]>([]);

  useEffect(() => {
    setMine(readSeen());
    let live = true;
    fetch("/api/reactions")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && d?.counts) setCounts(d.counts);
      })
      .catch(() => {
        /* no store, no panel — see the note above */
      });
    return () => {
      live = false;
    };
  }, []);

  const react = useCallback(
    async (slug: string) => {
      /*
       * Optimistic, because the round trip is long enough to feel like the
       * click missed. The server's response replaces this, so a rejected
       * press corrects itself rather than leaving a number that was never
       * counted.
       */
      setCounts((c) => (c ? { ...c, [slug]: (c[slug] ?? 0) + 1 } : c));
      setMine((m) => {
        const next = m.includes(slug) ? m : [...m, slug];
        try {
          localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        } catch {
          /* storage unavailable — the reaction still counts server-side */
        }
        return next;
      });

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = res.ok ? await res.json() : null;
        if (data?.counts) setCounts(data.counts);
      } catch {
        /* leave the optimistic value; the next load reconciles it */
      }
    },
    [],
  );

  if (!counts) return null;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section aria-labelledby="reactions-heading" className="panel">
      <div className="panel-bar">
        <h2 id="reactions-heading" className="panel-bar-title">
          Reactions
        </h2>
        {/*
          The total is the figure Bradley asked for, and it's stated as what it
          is — a live count across everyone, not this browser's.
        */}
        <span className="panel-bar-meta">
          {total.toLocaleString()} total
        </span>
      </div>

      <div className="p-5">
        <p className="t-meta">No account needed.</p>

        <ul className="mt-3 flex flex-wrap gap-2">
          {REACTIONS.map(({ slug, emoji, label }) => {
            const pressed = mine.includes(slug);
            return (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => react(slug)}
                  aria-label={`${label} — ${counts[slug] ?? 0} so far`}
                  aria-pressed={pressed}
                  className={`flex items-center gap-2 border px-3 py-1.5 text-[15px] leading-none transition-colors ${
                    pressed
                      ? "border-accent/50 bg-accent/10"
                      : "border-line bg-panel2/60 hover:border-accent/40 hover:bg-accent/[0.06]"
                  }`}
                >
                  <span aria-hidden>{emoji}</span>
                  {/* Tabular figures, or the row twitches sideways as counts
                      tick past a digit boundary. */}
                  <span className="font-mono text-[12px] tabular-nums text-copy">
                    {counts[slug] ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
