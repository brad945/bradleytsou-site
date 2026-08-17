"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { REACTIONS, type ReactionCounts } from "@/lib/reactions";

/**
 * Emoji reactions that cost a visitor nothing — no account, no sign-in — and
 * fly up the screen when pressed, the way they do in a Teams call.
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
 * ## What localStorage *is* used for
 *
 * Remembering which ones **you** already pressed, so the button reads as spent.
 * That's UI state about this browser, which is exactly what localStorage is
 * honest for. It is not the count, and it is not a limit — clearing it lets you
 * press again, and the server's per-IP ceiling is what actually bounds abuse.
 *
 * ## The flying emoji
 *
 * Pressing spawns two or three, each with a randomly chosen path and randomised
 * drift, spin, distance, size and duration. **Randomised because identical arcs
 * read as a UI effect rather than as people reacting** — the variation is the
 * whole illusion. They're removed on `animationend`, so nothing accumulates.
 *
 * They're `pointer-events-none` and `aria-hidden`: the count is the real
 * feedback, and a screen reader shouldn't hear a stream of confetti.
 */

const SEEN_KEY = "exy:reacted";

/** How many fly up per press. More than one reads as a burst, not a cursor. */
const BURST_MIN = 2;
const BURST_MAX = 3;

const PATHS = [
  "animate-emoji-rise",
  "animate-emoji-arc-l",
  "animate-emoji-arc-r",
] as const;

type Floater = {
  id: number;
  emoji: string;
  path: string;
  style: React.CSSProperties;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

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
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [popping, setPopping] = useState<string | null>(null);
  /** Monotonic, so React keys stay unique across rapid presses. */
  const nextId = useRef(0);

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

  const burst = useCallback((emoji: string) => {
    // Respect a reduced-motion preference by simply not spawning any.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const made: Floater[] = [];
    const n = Math.round(rand(BURST_MIN, BURST_MAX));
    for (let i = 0; i < n; i++) {
      made.push({
        id: nextId.current++,
        emoji,
        path: pick(PATHS),
        style: {
          // Spread the launch points so a burst doesn't leave as one clump.
          left: `${rand(20, 80)}%`,
          "--dx": `${rand(-38, 38)}px`,
          "--dy": `${rand(-190, -130)}px`,
          "--spin": `${rand(-45, 45)}deg`,
          "--end-scale": `${rand(0.7, 1.1)}`,
          "--dur": `${rand(1.5, 2.3)}s`,
          // Stagger within the burst, or they move as a rigid formation.
          animationDelay: `${i * rand(50, 130)}ms`,
        } as React.CSSProperties,
      });
    }
    setFloaters((f) => [...f, ...made]);
  }, []);

  const react = useCallback(
    async (slug: string, emoji: string) => {
      burst(emoji);
      setPopping(slug);

      /*
       * Optimistic, because the round trip is long enough to feel like the
       * click missed. The server's response replaces this, so a rejected press
       * corrects itself rather than leaving a number that was never counted.
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
    [burst],
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
          The total is the figure Bradley asked for, stated as what it is — a
          live count across everyone, not this browser's.
        */}
        <span className="panel-bar-meta tabular-nums">
          {total.toLocaleString()} total
        </span>
      </div>

      {/*
        `relative` anchors the floaters; `overflow-visible` lets them leave.
        They're absolutely positioned against this box and travel upward out
        of it, over whatever sits above.
      */}
      <div className="relative p-5">
        <p className="t-meta">No account needed.</p>

        {/* The flight deck. Ignored by pointers and by screen readers — the
            count is the real feedback. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 z-10 h-0"
          aria-hidden
        >
          {floaters.map((f) => (
            <span
              key={f.id}
              className={`absolute select-none text-[26px] leading-none ${f.path}`}
              style={f.style}
              onAnimationEnd={() =>
                setFloaters((cur) => cur.filter((x) => x.id !== f.id))
              }
            >
              {f.emoji}
            </span>
          ))}
        </div>

        <ul className="mt-3 flex flex-wrap gap-2">
          {REACTIONS.map(({ slug, emoji, label }) => {
            const pressed = mine.includes(slug);
            return (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => react(slug, emoji)}
                  aria-label={`${label} — ${counts[slug] ?? 0} so far`}
                  aria-pressed={pressed}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 leading-none transition-colors ${
                    pressed
                      ? "border-accent/50 bg-accent/10"
                      : "border-line bg-panel2/60 hover:border-accent/40 hover:bg-accent/[0.06]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`text-[19px] ${
                      popping === slug ? "animate-emoji-pop" : ""
                    }`}
                    onAnimationEnd={() => setPopping(null)}
                  >
                    {emoji}
                  </span>
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
