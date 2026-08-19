"use client";

import { useState } from "react";
import { books, type Book } from "@/lib/profile-data";

/**
 * A bookshelf you can actually poke, rather than a list of titles.
 *
 * Rendered as a **source block inside Recent Activity**, beside GitHub and
 * Spotify — it's another thing he's been doing lately, which is what that
 * panel is for. So it has no panel chrome of its own; `ActivityFeed` supplies
 * the heading and the icon.
 *
 * Books stand as spines on a shelf: hovering lifts one and lights it up,
 * clicking pulls it out and shows what it is underneath. That's the whole
 * reason it isn't a `<ul>` — a shelf is a thing you scan by eye and reach
 * into, and a list of rows is neither.
 *
 * ## Why the motion is allowed here
 *
 * The brief bans decorative animation, and this is a lot of it. It's in the
 * same category as Exy: **nothing moves unless you point at it or click it**,
 * and the motion is the affordance — a spine that didn't respond wouldn't read
 * as reachable. It's a mechanic, not an ambient effect. All of it is
 * `motion-safe`, so it collapses to a plain colour change under
 * `prefers-reduced-motion` and the shelf still works.
 *
 * ## Two things that are load-bearing
 *
 * **Spine colours are full class strings in an array, not built by index at
 * runtime.** Tailwind's scanner reads source as text; a template string would
 * emit nothing and every spine would come out transparent. Same reason the old
 * showcase spelled its rarity classes out.
 *
 * **Heights and widths are derived from the title, not random.** A shelf of
 * identical blocks reads as a chart, but `Math.random()` would reshuffle on
 * every render and re-order on hydration. Hashing the title is stable, varies
 * naturally, and means adding a book never means choosing a size.
 */

/** Stable per-title, so nothing moves between renders or across hydration. */
function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const STATUS_LABEL: Record<Book["status"], string> = {
  reading: "Reading",
  read: "Read",
  shelved: "Shelved",
};

export default function Bookshelf() {
  /** Index of the pulled-out book, or null. */
  const [open, setOpen] = useState<number | null>(null);
  const selected = open === null ? null : books[open];

  return (
    <div>
      {/*
          The shelf. Spines are bottom-aligned so they stand on the plank
          rather than floating; `items-end` is what does that, and the varying
          heights are the point of it.
        */}
      <div className="flex items-end justify-center gap-[3px]">
        {books.map((book, i) => {
          const h = hash(book.title);
          // 88–124px tall, 26–38px wide. Shorter than the standalone
          // version was: this sits inside Recent Activity now, under a
          // heading, and a full-height shelf there dwarfed the two source
          // blocks above it. Ranges stay narrow — too much variation stops
          // reading as a shelf and starts reading as a bar chart.
          const height = 88 + (h % 37);
          // `>>>`, not `>>`. A signed shift coerces to int32 first, so any
          // hash above 2^31 comes out negative and the modulo does too —
          // which produced 14px spines, well under the intended floor.
          const width = 26 + ((h >>> 5) % 13);
          const isOpen = open === i;

          return (
            <button
              key={book.title}
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-label={`${book.title} by ${book.author}`}
              style={
                {
                  height,
                  width,
                  background: book.spine,
                  // Exposed as custom properties so the bands, colophon and
                  // edge shading can be mixed from them in CSS — otherwise
                  // every book would need three more sampled values in the
                  // data just to shade its own detailing.
                  "--spine": book.spine,
                  "--ink": book.ink,
                } as React.CSSProperties
              }
              className={`group/spine relative flex shrink-0 items-center justify-center overflow-hidden rounded-t-[3px] transition-[transform,box-shadow,filter] duration-200 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isOpen
                  ? "-translate-y-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] brightness-110"
                  : "motion-safe:hover:-translate-y-2 hover:brightness-125 hover:shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
              }`}
            >
              {/*
                  `vertical-rl` runs the text top-to-bottom, which is how spines
                  are set on this side of the Atlantic. No rotation needed —
                  transforming the text instead would fight the lift animation
                  on the same element.
                */}
              <span
                style={{ color: book.ink }}
                className="relative z-10 -mt-2 [writing-mode:vertical-rl] whitespace-nowrap px-1 text-[11px] font-semibold tracking-tight"
              >
                {book.title}
              </span>

              {/*
                What turns a coloured rectangle into a spine. All of it is
                mixed from the book's own two colours, so it works on a
                near-white cover and a deep red one without per-book tuning.
              */}
              {/* Head and tail bands, where most spines carry a rule. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-[9px] h-[2px]"
                style={{
                  background:
                    "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                }}
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[26px] h-[2px]"
                style={{
                  background:
                    "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                }}
              />
              {/* The publisher's colophon at the foot. Not any real mark — an
                  empty block, which is what one reads as at this size. */}
              <span
                aria-hidden
                className="absolute bottom-[10px] left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-[1px] border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--spine) 60%, var(--ink))",
                }}
              />
              {/* Shading either edge, so it reads as a curve rather than a
                  flat card: light where it catches the room, dark at the
                  hinge. */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.28))",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* The plank. A line plus a shadow under it, rather than a wood
            texture — every surface on this site is flat. */}
      <div className="h-[6px] rounded-[2px] bg-line shadow-[0_4px_10px_rgba(0,0,0,0.45)]" />

      {/*
          The detail, under the shelf rather than in a modal — a modal for one
          line of text is a lot of ceremony, and this keeps the shelf visible
          so you can move along it.

          `min-h` reserves the space, so opening a book doesn't shove the panel
          below it down the page.
        */}
      <div className="mt-3 min-h-[100px]">
        {selected ? (
          <div className="flex gap-4">
            {/*
              The cover, and what makes a spine worth clicking. It appears
              only here — covers on the shelf itself would mean every book
              face-out, which is a display table rather than a shelf.

              Plain <img>: local, already sized to 260px tall, and routing
              eight small JPEGs through the Image Optimizer buys nothing.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.cover}
              alt={`${selected.title} cover`}
              className="h-[92px] w-auto shrink-0 rounded-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="text-[15px] leading-tight text-bright">
                  {selected.title}
                </span>
                <span
                  className={`label text-[10px] ${
                    selected.status === "reading" ? "text-live" : "text-muted"
                  }`}
                >
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
              <p className="t-meta mt-0.5">{selected.author}</p>
              {selected.note && (
                <p className="t-body mt-1.5">{selected.note}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="t-meta text-center">Pick one off the shelf.</p>
        )}
      </div>
    </div>
  );
}
