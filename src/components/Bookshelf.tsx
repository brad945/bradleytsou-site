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

/** How far the shelf runs back. Books are drawn shallower, so they sit in it. */
const SHELF_DEPTH = 130;

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
        A shelf, built as an actual box: back panel, two side walls, a floor
        and a front lip, with the books standing inside it.

        Every face is a plain div folded into place, and each fold has one
        correct sign that is easy to get backwards — all four are spelled out
        below because getting one wrong puts a wall in front of the books
        instead of behind them, and it is not obvious from the result which
        one is at fault.

        `perspective` and `perspective-origin` live here, on the one element
        that contains the whole scene. Per-face they'd each get their own
        vanishing point and the box wouldn't close up.
      */}
      <div style={{ perspective: "1200px", perspectiveOrigin: "50% 8%" }}>
        <div
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back panel: straight back by the shelf's depth. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-wood-back"
            style={{ transform: `translateZ(-${SHELF_DEPTH}px)` }}
          />
          {/*
            Side walls. `rotateY(90deg)` about the LEFT edge folds a div
            backward; about the right edge it needs `-90`. Each one's visible
            face then points inward, into the shelf.
          */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-wood-side"
            style={{
              width: SHELF_DEPTH,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 bg-wood-side"
            style={{
              width: SHELF_DEPTH,
              transformOrigin: "right center",
              transform: "rotateY(-90deg)",
            }}
          />
          {/*
            Floor. Hinged at its own BOTTOM edge with `rotateX(90deg)`, which
            folds it backward and leaves its lit face pointing up. Hinging at
            the top edge with `-90` puts it in the same place with its face
            pointing down — which renders as a dark slab, and was why the book
            tops kept vanishing.
          */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 bg-wood-floor"
            style={{
              height: SHELF_DEPTH,
              transformOrigin: "center bottom",
              transform: "rotateX(90deg)",
            }}
          />

          {/* The books, standing on that floor. */}
          <div
            className="flex items-end justify-center gap-[9px] px-8 pt-7"
            style={{ transformStyle: "preserve-3d" }}
          >
            {books.map((book, i) => {
              const h = hash(book.title);
              const height = 158 + (h % 54);
              const width = 26 + ((h >>> 5) % 13);
              const isOpen = open === i;

              const label = book.spineLabel ?? book.title;
              const room = height - 50;
              const fontSize = Math.max(
                8,
                Math.min(11, Math.floor(room / (label.length * 0.5))),
              );
              // Real books run about two thirds as deep as they are tall.
              const depth = Math.round(height * 0.62);

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
                      // The bottom front edge, where the book meets the floor.
                      transformOrigin: "center bottom",
                      ...(isOpen ? { "--deg": "-34deg" } : {}),
                    } as React.CSSProperties
                  }
                  /*
                   * **No `filter` on this element, ever.** `filter` forces
                   * `transform-style: flat`, overriding `preserve-3d` — so a
                   * `hover:brightness` here collapsed the book's faces into
                   * one plane and its top vanished the moment you pointed at
                   * it. The brightening lives on the faces instead, where
                   * flattening their own 2D children costs nothing.
                   */
                  className={`group/spine relative shrink-0 [--deg:-12deg] [transform:rotateX(var(--deg))] transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:hover:[--deg:-34deg] ${
                    isOpen ? "z-20" : "z-0"
                  }`}
                >
                  {/*
                    The pages — the book's top face.

                    Sits ABOVE the spine (`bottom-full`) and hinges at its own
                    bottom edge, so `rotateX(90deg)` folds it backward with its
                    lit side up. The earlier version hinged it at the top edge
                    with `-90`: same position, face pointing down, so what you
                    saw was its underside and it dropped out of view entirely
                    once a book tipped far enough. That was the disappearing
                    top.
                  */}
                  <span
                    aria-hidden
                    style={{
                      height: depth,
                      background: `color-mix(in srgb, ${book.spine} 74%, #000)`,
                      transformOrigin: "center bottom",
                      transform: "rotateX(90deg)",
                    }}
                    className={`absolute inset-x-0 bottom-full transition-[filter] duration-300 ${
                      isOpen
                        ? "brightness-110"
                        : "group-hover/spine:brightness-110"
                    }`}
                  />

                  {/* The spine, facing you. */}
                  <span
                    aria-hidden
                    style={
                      {
                        background: book.spine,
                        "--spine": book.spine,
                        "--ink": book.ink,
                      } as React.CSSProperties
                    }
                    className={`absolute inset-0 overflow-hidden rounded-t-[1px] transition-[filter] duration-300 ${
                      isOpen
                        ? "brightness-110"
                        : "group-hover/spine:brightness-110"
                    }`}
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
                          "linear-gradient(to right, rgba(255,255,255,0.14), rgba(255,255,255,0) 20%, rgba(0,0,0,0) 74%, rgba(0,0,0,0.26))",
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

          {/*
            The front lip, at z = 0 and last in the DOM, so it sits in front of
            the books' feet the way a real shelf edge does.
          */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-full h-[11px] rounded-b-[2px] bg-wood-lip"
          />
        </div>
      </div>
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
