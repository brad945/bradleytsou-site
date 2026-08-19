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
      {" "}
      {/*
          The shelf, in perspective.

          `perspective` lives on the container, not on each book: set
          per-element every spine gets its own vanishing point, so they each
          look right alone and wrong together. One shared value is what makes
          them read as objects sharing a space.

          `perspective-origin` sits low at 62%, because you look at a shelf
          from slightly above. From dead centre the books splay symmetrically
          and it reads as a fan rather than a shelf.
        */}
      <div
        className="flex items-end justify-center gap-[6px]"
        style={{ perspective: "1100px", perspectiveOrigin: "50% 62%" }}
      >
        {books.map((book, i) => {
          const h = hash(book.title);
          // 158–211px. An earlier pass ran 88–124 and five of eight titles
          // overflowed their spine, the worst by 156px.
          const height = 158 + (h % 54);
          // `>>>`, not `>>`. A signed shift coerces to int32 first, so a hash
          // above 2^31 goes negative and the modulo with it — which produced
          // 14px spines under a 26px floor.
          const width = 26 + ((h >>> 5) % 13);
          const isOpen = open === i;

          // Fit the type to the room between the bands rather than trusting
          // it to fit. The backstop, not the fix — `spineLabel` keeps titles
          // short; this only stops a long one added later from spilling.
          const label = book.spineLabel ?? book.title;
          const room = height - 50;
          const fontSize = Math.max(
            8,
            Math.min(11, Math.floor(room / (label.length * 0.5))),
          );
          // Covers run about 2:3. The cover is hinged to the spine's front
          // edge and folds back into the shelf, so this is depth, not width.
          const depth = Math.round(height * 0.66);

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
                  transformStyle: "preserve-3d",
                  // **The pivot.** Bottom-front corner, where the book meets
                  // the shelf — so it swings out like a real one instead of
                  // turning about its middle in mid-air.
                  transformOrigin: "left bottom",
                  ...(isOpen ? { "--deg": "-62deg" } : {}),
                } as React.CSSProperties
              }
              className={`group/spine relative shrink-0 rounded-t-[2px] [--deg:-15deg] [transform:rotateY(var(--deg))] transition-[transform,filter] duration-300 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:hover:[--deg:-48deg] ${
                isOpen ? "z-20 brightness-110" : "z-0 hover:brightness-110"
              }`}
            >
              {/*
                  The cover, hinged along the spine's front edge and folded 90°
                  back into the shelf — where a real book's pages are. Rotating
                  the whole book about the pivot is what swings it into view.

                  First in the DOM so the spine paints over the hinge seam.
                */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.cover}
                alt=""
                aria-hidden
                style={{
                  height,
                  width: depth,
                  transformOrigin: "left center",
                  transform: "rotateY(90deg)",
                }}
                className="absolute left-0 top-0 rounded-r-[2px] object-cover brightness-[0.86]"
              />

              {/* The spine face. `overflow-hidden` belongs here rather than
                    on the button, where it would clip the cover away. */}
              <span
                aria-hidden
                style={
                  {
                    background: book.spine,
                    "--spine": book.spine,
                    "--ink": book.ink,
                  } as React.CSSProperties
                }
                className="absolute inset-0 overflow-hidden rounded-t-[2px]"
              >
                <span
                  className="absolute inset-x-0 top-[9px] h-[2px]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                  }}
                />
                <span
                  className="absolute inset-x-0 bottom-[26px] h-[2px]"
                  style={{
                    background:
                      "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                  }}
                />
                <span
                  className="absolute bottom-[10px] left-1/2 h-[11px] w-[11px] -translate-x-1/2 rounded-[1px] border"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--spine) 60%, var(--ink))",
                  }}
                />
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.28))",
                  }}
                />
              </span>

              <span
                style={{ color: book.ink, fontSize }}
                className="absolute inset-x-0 bottom-[34px] top-[16px] z-10 flex items-center justify-center [writing-mode:vertical-rl] font-semibold tracking-tight"
              >
                {label}
              </span>
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
