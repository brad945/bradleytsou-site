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

/** How far the shelf runs back. Books are drawn shallower, so they sit in it. */
const SHELF_DEPTH = 110;

/**
 * Smallest spine type before a title stops reading as a title.
 *
 * Used twice and in opposite directions: as the floor a book's height is
 * sized to carry, and (as 7) as the hard floor `fontSize` clamps to if a
 * title still doesn't fit. They can disagree by 2pt without anything
 * breaking, because the height rule is a minimum and the clamp is a
 * last resort.
 */
const MIN_SPINE_FS = 8;

/**
 * Pixels per inch, and there are two of them on purpose.
 *
 * **Height is to scale.** An 11in Calvin and Hobbes treasury renders 1.4x the
 * height of an 8in Sula, because that is the ratio between them. This
 * replaced sizes hashed out of the title, under which a 656-page hardcover and
 * a 144-page play stood the same height and the shelf described nothing.
 *
 * **Thickness is exaggerated, by about 3x, and it has to be.** Sula is
 * 8in x 0.5in; at the height scale its spine would be 8px wide and a vertical
 * title does not fit in 8px. The exaggeration is one uniform factor, so every
 * book stays right *relative to* every other — which is the part a reader can
 * see — and only the absolute ratio of thickness to height is off.
 *
 * `THICK_PER_IN` is also what decides how much of the shelf the row fills: at
 * 52 the eight books plus their 20px gaps come to about 500px of the ~567px
 * opening. Raise it and they crowd the uprights; lower it and the shelf starts
 * to look empty.
 */
const HEIGHT_PER_IN = 15.2;

/**
 * The suspension wires, and the geometry behind them.
 *
 * Bradley wanted the shelf to read as jutting out of the page toward you, and
 * the way a real floating shelf says that is a cable from each front corner
 * running back and up to the wall. Nothing about the shelf itself changes; the
 * wires just give the eye two lines whose convergence is only explicable by
 * depth.
 *
 * Each wire is one thin div standing on a front-top corner and folded back
 * about its own bottom edge, exactly like the floor and the ceiling. Solve for
 * the two numbers rather than eyeballing them: the far end has to land on the
 * wall, at (-RISE, -SHELF_DEPTH) in the corner's own frame, so
 *
 *   length = hypot(RISE, SHELF_DEPTH)      angle = atan2(SHELF_DEPTH, RISE)
 *
 * and the browser does the rest. **The convergence is not drawn.** Both wires
 * stay at their own corner's x in world space; they lean toward each other on
 * screen only because their far ends are 110px deeper, which is the whole
 * point — it's real perspective rather than two lines angled by hand, so it
 * stays correct at any width the column takes.
 *
 * `RISE` is capped by what's above the shelf: the wires overshoot the block by
 * about 38px on screen, so the container's top margin has to clear that or
 * they cross the Books heading.
 */
const WIRE_RISE = 32;
const WIRE_LEN = Math.round(Math.hypot(WIRE_RISE, SHELF_DEPTH));
const WIRE_TILT = Math.round(
  (Math.atan2(SHELF_DEPTH, WIRE_RISE) * 180) / Math.PI,
);
const WIRE_W = 5;
const THICK_PER_IN = 52;

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
    /*
      `mt-4` because the shelf is a solid object and the two other source
      blocks are rows of text: at `SourceBlock`'s own 8px the heading sat on
      the carcass rather than above it. Local to this block on purpose —
      GitHub and Spotify still want the tighter default.
    */
    /*
      `mt-12` rather than `mt-6`: the suspension wires overshoot the top of the
      block by about 38px, and at the smaller margin they crossed the Books
      heading. Raise WIRE_RISE and this has to go up with it.
    */
    <div className="mt-12">
      {/*
        A shelf, built as an actual box: back panel, two side walls, a floor,
        and in front of all of it a carcass — two uprights, a board across the
        top, the lip below — with the books standing inside.

        **The carcass is what gives the shelf an edge.** Without it the
        opening was a hole in nothing: the walls met the page with no
        material between them, so the whole thing read as one flat plane
        however much depth was behind it. Each board is lit across its own
        width, so it has a visible thickness the opening sits behind.

        **The books stand upright in it.** They leaned 12° forward first and
        it looked wrong for a reason worth keeping: a leaning book inside a
        square box has nothing holding it up, so the two read as separate
        objects at odds with each other. All the depth comes from the camera
        instead — `perspective-origin` sits above the box, so you look down
        into the shelf and see its floor and the tops of the books, with
        everything square to everything else. A hovered book is then the only thing in
        the scene that isn't, which is what makes it read as pulled out.

        Every face is a plain div folded into place, and each fold has one
        correct sign that is easy to get backwards — all four are spelled out
        below because getting one wrong puts a wall in front of the books
        instead of behind them, and it is not obvious from the result which
        one is at fault.

        `perspective` and `perspective-origin` live here, on the one element
        that contains the whole scene. Per-face they'd each get their own
        vanishing point and the box wouldn't close up.
      */}
      <div style={{ perspective: "900px", perspectiveOrigin: "50% -85px" }}>
        <div
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back panel: straight back by the shelf's depth. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-shelf-back"
            style={{ transform: `translateZ(-${SHELF_DEPTH}px)` }}
          />
          {/*
            The ceiling, and the box does not close without it. The eye sits
            above the container's top edge, so the inner walls and the back
            panel project *above* that edge — you could see a wedge of shelf
            interior carrying on over the top board, which is what made the
            board look like it was floating in front of a hole rather than
            capping a box.

            Hinged at its own bottom edge like the floor, so it folds backward
            with its lit face up. That face is the top of the carcass, seen
            from slightly above, which is why it's the brightest surface here
            — it's the one pointing at the light.
          */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-full bg-shelf-ceiling"
            style={{
              height: SHELF_DEPTH,
              transformOrigin: "center bottom",
              transform: "rotateX(90deg)",
            }}
          />
          {/*
            Side walls. `rotateY(90deg)` about the LEFT edge folds a div
            backward; about the right edge it needs `-90`. Each one's visible
            face then points inward, into the shelf.
          */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-shelf-side-left"
            style={{
              width: SHELF_DEPTH,
              transformOrigin: "left center",
              transform: "rotateY(90deg)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 bg-shelf-side-right"
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
            className="absolute inset-x-0 bottom-0 bg-shelf-floor"
            style={{
              height: SHELF_DEPTH,
              transformOrigin: "center bottom",
              transform: "rotateX(90deg)",
            }}
          />

          {/* The books, standing on that floor. */}
          <div
            className="flex items-end justify-center gap-[16px] px-4 pt-8"
            style={{ transformStyle: "preserve-3d" }}
          >
            {books.map((book, i) => {
              /*
               * Straight off the edition's real spine thickness. The floor of
               * 18px is there because a thinner spine can't carry its own
               * title; nothing on the shelf is near it today.
               */
              const width = Math.max(
                18,
                Math.round(book.thickIn * THICK_PER_IN),
              );
              const isOpen = open === i;

              const label = book.spineLabel ?? book.title;
              /*
               * True trim height, with the label floor kept as a backstop.
               *
               * It doesn't fire for any of the eight today. The two that
               * would have — Common Sense Investing and The Complete Peanuts,
               * both short books with long titles — carry shortened
               * `spineLabel`s instead, which is what a real spine does at that
               * size anyway. The floor stays because a long-titled short book
               * added later would otherwise ship unreadable, and it is better
               * for one book to stand slightly too tall than for its title to
               * be a smudge.
               */
              const height = Math.max(
                Math.round(book.heightIn * HEIGHT_PER_IN),
                Math.round(label.length * MIN_SPINE_FS * 0.56) + 34,
              );
              const room = height - 34;
              /*
               * 0.56em per character is a deliberate over-estimate of Open
               * Sans semibold's advance (~0.52), so the computed size errs
               * small. The floor is 7 rather than 8 because the shortest
               * book is now 127px: at 8 the longest title overran its own
               * spine, and a clamped size that doesn't fit is worse than a
               * small one that does.
               */
              const fontSize = Math.max(
                7,
                Math.min(13, Math.floor(room / (label.length * 0.56))),
              );
              /*
               * Two thirds as deep as tall, like a real book — but capped
               * short of the shelf's own depth, or the tallest one runs
               * straight through the back panel.
               */
              const depth = Math.min(
                Math.round(height * 0.62),
                SHELF_DEPTH - 14,
              );

              /*
               * Wrapper, and it does not rotate. The shadow below lies in the
               * floor plane; if it lived inside the button it would tip up off
               * the floor with the book, which is the one thing a shadow can
               * never do. So the button carries the rotation and the wrapper
               * carries the ground.
               */
              return (
                <div
                  key={book.title}
                  style={{ height, width, transformStyle: "preserve-3d" }}
                  className="group/book relative shrink-0"
                >
                  {/*
                    Cast shadow, in the floor plane — hinged at its own bottom
                    edge exactly like the shelf floor, so it folds backward
                    with its face up rather than showing its underside.

                    Light is top-left, the same source the shelf's own
                    gradients and the avatar frame are lit from, so the shadow
                    falls back and to the RIGHT: hence the asymmetric inset and
                    the diagonal in the gradient. It runs a little past the
                    book's depth because a real one does.

                    Dynamic in the sense that matters: `--sh` stretches it
                    along the depth axis when the book tips out, since a book
                    leaning toward you throws a longer shadow. `scaleY` sits
                    to the right of the rotate so it scales in the panel's own
                    frame — which after folding is the floor's depth.
                  */}
                  <span
                    aria-hidden
                    style={{
                      height: depth + 16,
                      transformOrigin: "center bottom",
                      transform: "rotateX(90deg) scaleY(var(--sh))",
                      background:
                        "linear-gradient(to top right, rgba(0,0,0,0.68), rgba(0,0,0,0.26) 48%, rgba(0,0,0,0) 84%)",
                    }}
                    className="absolute bottom-0 left-[3px] right-[-20px] rounded-b-[2px] blur-[4px] [--sh:1] transition-transform duration-300 ease-out motion-safe:group-hover/book:[--sh:1.5]"
                  />
                  {/*
                    Contact shadow. The long one above falls away too gradually
                    to darken the inch of floor a book actually touches, and
                    without that the whole row hovered a fraction above the
                    plank. Short, much darker, barely blurred — that's what
                    reads as weight. It scales on the same `--sh`, so it
                    stretches out from under the book as it tips.
                  */}
                  <span
                    aria-hidden
                    style={{
                      height: Math.round(depth * 0.34),
                      transformOrigin: "center bottom",
                      transform: "rotateX(90deg) scaleY(var(--sh))",
                      background:
                        "linear-gradient(to top right, rgba(0,0,0,0.72), rgba(0,0,0,0) 76%)",
                    }}
                    className="absolute bottom-0 left-[1px] right-[-7px] blur-[1.5px] transition-transform duration-300 ease-out"
                  />

                  {/*
                    The book's shadow on the back wall.
                    
                    The floor shadow below was the only cast shadow here, and
                    between books you mostly see the BACK of the shelf, not its
                    floor — so the one surface a reader actually looks at had
                    nothing on it. This is the missing half.

                    Where it lands follows from the light being above, in front
                    and to the left: the edge doing the casting is the book's
                    back edge, `SHELF_DEPTH - depth` short of the wall, so the
                    shadow sits just right of and below the book rather than
                    far from it. Both offsets are computed from that gap, which
                    is why a shallow book throws its shadow further than a deep
                    one — it has more room between itself and the wall.

                    It sits a pixel proud of the back panel so it can't
                    z-fight with it, and it fades as the book tips out, which
                    is what happens: a book leaning toward you stops blocking
                    the wall behind it.
                  */}
                  <span
                    aria-hidden
                    style={{
                      transform: `translateZ(-${SHELF_DEPTH - 1}px) translate(${Math.round((SHELF_DEPTH - depth) * 0.42) + 2}px, ${Math.round((SHELF_DEPTH - depth) * 0.44) + 3}px)`,
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.58), rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.14))",
                    }}
                    className="absolute inset-0 blur-[5px] transition-opacity duration-300 motion-safe:group-hover/book:opacity-35"
                  />

                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-label={`${book.title} by ${book.author}`}
                    style={
                      {
                        transformStyle: "preserve-3d",
                        // The bottom front edge, where the book meets the floor.
                        transformOrigin: "center bottom",
                        "--spine": book.spine,
                        "--ink": book.ink,
                        ...(isOpen ? { "--deg": "-30deg" } : {}),
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
                    className={`group/spine absolute inset-0 [--deg:0deg] [transform:rotateX(var(--deg))] transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:hover:[--deg:-30deg] ${
                      isOpen ? "z-20" : "z-0"
                    }`}
                  >
                    {/*
                      The two covers, which are what you actually see of a
                      book's depth on a shelf. They were missing entirely —
                      the book was a spine and a top and nothing between them,
                      which is why it read flat however the camera moved.

                      `backface-visibility: hidden` is what makes this need no
                      per-book logic: each face draws only while it genuinely
                      faces the camera, so books left of the vanishing point
                      show their right cover and books right of it show their
                      left, and the switch happens exactly where it should.

                      Their shading is the same top-left light as everything
                      else: a left-facing cover catches it and a right-facing
                      one is turned away, so the lit face is the one you see on
                      the right of the shelf. Each also darkens toward the back,
                      which is the shelf's own shade falling on it.
                    */}
                    <span
                      aria-hidden
                      style={{
                        width: depth,
                        transformOrigin: "right center",
                        transform: "rotateY(-90deg)",
                        backfaceVisibility: "hidden",
                        background: `linear-gradient(to left, color-mix(in srgb, var(--spine) 82%, #fff), color-mix(in srgb, var(--spine) 60%, #000))`,
                      }}
                      className={`absolute inset-y-0 right-full transition-[filter] duration-300 ${
                        isOpen
                          ? "brightness-110"
                          : "group-hover/spine:brightness-110"
                      }`}
                    />
                    <span
                      aria-hidden
                      style={{
                        width: depth,
                        transformOrigin: "left center",
                        transform: "rotateY(90deg)",
                        backfaceVisibility: "hidden",
                        background: `linear-gradient(to right, color-mix(in srgb, var(--spine) 58%, #000), color-mix(in srgb, var(--spine) 34%, #000))`,
                      }}
                      className={`absolute inset-y-0 left-full transition-[filter] duration-300 ${
                        isOpen
                          ? "brightness-110"
                          : "group-hover/spine:brightness-110"
                      }`}
                    />

                    {/*
                      The page block — the book's top face.

                      Sits ABOVE the spine (`bottom-full`) and hinges at its own
                      bottom edge, so `rotateX(90deg)` folds it backward with its
                      lit side up. The earlier version hinged it at the top edge
                      with `-90`: same position, face pointing down, so what you
                      saw was its underside and it dropped out of view entirely
                      once a book tipped far enough. That was the disappearing
                      top.

                      Paper, not the cover colour. It was a darkened tint of
                      the spine, which is what a shelf never shows you: the top
                      of a book standing spine-out is its page block, and paper
                      against a coloured spine is most of what reads as a solid
                      object. The stripes run across the width because that is
                      how pages stack — the spine's width IS the thickness of
                      the stack — and each one is a single page's edge.
                    */}
                    <span
                      aria-hidden
                      style={{
                        height: depth,
                        transformOrigin: "center bottom",
                        transform: "rotateX(90deg)",
                        background: `
                          repeating-linear-gradient(to right, rgba(0,0,0,0.07) 0 1px, rgba(0,0,0,0) 1px 2.5px),
                          linear-gradient(to top, rgba(0,0,0,0.22), rgba(0,0,0,0) 55%),
                          color-mix(in srgb, #f1ebdd 88%, var(--spine))`,
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
                        className="absolute inset-x-0 top-[7px] h-[2px]"
                        style={{
                          background:
                            "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                        }}
                      />
                      <span
                        className="absolute inset-x-0 bottom-[20px] h-[2px]"
                        style={{
                          background:
                            "color-mix(in srgb, var(--spine) 72%, var(--ink))",
                        }}
                      />
                      <span
                        className="absolute bottom-[8px] left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-[1px] border"
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
                      className="absolute inset-x-0 bottom-[24px] top-[10px] z-10 flex items-center justify-center [writing-mode:vertical-rl] font-semibold tracking-tight"
                    >
                      {label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/*
            The front lip, at z = 0 and last in the DOM, so it sits in front of
            the books' feet the way a real shelf edge does.
          */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[16px] bg-shelf-board-left"
          />
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-[16px] bg-shelf-board-right"
          />
          {/*
            Inset between the uprights, the way a real carcass is built: the
            sides run the full height and the boards sit between them. Butting
            it over them instead reads as a picture frame rather than a shelf.
          */}
          <span
            aria-hidden
            className="absolute left-[16px] right-[16px] top-0 h-[14px] bg-shelf-board-top"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 top-full h-[14px] rounded-b-[2px] bg-shelf-lip"
          />

          {/*
            The wires. Last in the DOM so they paint over the corner they land
            on, and `bottom-full` so each one stands on the top edge of an
            upright — 7px in, which is the middle of the 16px board.

            `preserve-3d` on the wire is what lets its anchor plate sit in the
            wall plane instead of lying along the cable: the plate carries the
            opposite rotation, which cancels the wire's and leaves it facing
            forward.
          */}
          {[
            { key: "left", pos: "left-[6px]" },
            { key: "right", pos: "right-[6px]" },
          ].map(({ key, pos }) => (
            <span
              key={key}
              aria-hidden
              className={`absolute ${pos}`}
              style={{
                bottom: "calc(100% + 6px)",
                width: WIRE_W,
                height: WIRE_LEN,
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
                transform: `rotateX(${WIRE_TILT}deg)`,
              }}
            >
              {/*
                **Two crossed blades, not one.** A single div is a flat tape:
                shade it however you like and it stays a tape, because rotating
                the scene by a degree changes nothing about its width. A second
                copy turned 90° about the rod's own long axis gives it a
                cross-section, so it occupies volume the way every other part
                of this shelf does — which is the whole reason the shelf reads
                as an object and the wire didn't.

                `rotateY` is the right axis because inside this wrapper the
                rod's length runs along the local Y. Both blades carry the same
                cylindrical shading, so whichever one you're closer to
                edge-on with, the other is showing you a lit round surface.
              */}
              <span className="absolute inset-0 bg-shelf-wire" />
              <span
                className="absolute inset-0 bg-shelf-wire"
                style={{ transform: "rotateY(90deg)" }}
              />

              {/*
                The wall end: a bolt head, carrying the rod's rotation in
                reverse so it faces the viewer instead of lying along the rod.
                Without it the rod ends in mid-air.

                The shelf end is an eye bolt standing on the top plank — see
                below. It's a sibling of the rod rather than a child, because
                it belongs to the shelf.
              */}
              <span
                className="absolute left-1/2 top-0 h-[10px] w-[10px] rounded-full bg-shelf-fitting ring-1 ring-shelf-edge/60"
                style={{
                  transform: `translate(-50%, -50%) rotateX(${-WIRE_TILT}deg)`,
                }}
              />
            </span>
          ))}

          {/*
            The eye bolt each rod ends in, screwed into the TOP PLANK.

            Two things were wrong with the hook this replaces, and they were
            the same thing twice. It hung on the front face, in the z = 0
            plane, which is the one plane in this whole scene that faces the
            viewer square-on — so it was the only part of the shelf with no
            foreshortening on it, and it read flat next to everything else.
            And it was drawn as a single stroke, so its two arms were whatever
            length the path made them rather than being a shape with a front
            and a back.

            This sits on the plank instead. The base plate is folded into the
            horizontal plane exactly like the ceiling — `bottom-full` and
            `rotateX(90deg)` about its own bottom edge — so the same
            perspective that squashes the plank squashes it, which is what
            makes it look like it's lying on a surface rather than stuck to a
            wall. The eye then stands back up out of it, symmetric about the
            rod, and the rod drops 6px so it ends inside the ring rather than
            beside it.
          */}
          {["left-[3px]", "right-[3px]"].map((pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute bottom-full ${pos}`}
              style={{
                width: 11,
                height: 13,
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
                transform: "rotateX(90deg)",
              }}
            >
              {/*
                Where it meets the plank. The plate itself is foreshortened to
                about two pixels — the plank is 110px deep and roughly 10px
                tall on screen — so what actually does the work is the shadow
                pooled under it. Without that the eye floats a hair above the
                surface it's supposed to be screwed into.
              */}
              <span className="absolute inset-x-[-1px] bottom-0 top-[2px] rounded-[5px] bg-shelf-edge/55 blur-[2px]" />
              <span className="absolute inset-x-[2px] bottom-[2px] top-[4px] rounded-[2px] bg-shelf-fitting" />
              {/*
                The eye. Stands back up out of the plate — `rotateX(-90deg)`
                cancels the plate's fold — and is a ring rather than a hook, so
                it's the same on both sides of the rod. That symmetry is the
                point: a hook drawn as one stroke has a long arm and a short
                one, and at this size that reads as a mistake rather than as a
                hook.

                Two rings stacked make it a torus rather than a circle. The
                lower one is the dark body; the upper one paints only its top
                and left arcs in the lightest steel, so the highlight sits
                where the light is — the same top-left source as every other
                surface here. A flat stroke can't do that, and a flat stroke is
                what made the last one read as a sticker.
              */}
              <span
                className="absolute bottom-[3px] left-1/2 h-[11px] w-[11px]"
                style={{
                  transformOrigin: "center bottom",
                  transform: "translateX(-50%) rotateX(-90deg)",
                }}
              >
                <span className="absolute inset-0 rounded-full border-[2.5px] border-steelMid shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
                <span className="absolute inset-0 rounded-full border-[2.5px] border-b-transparent border-l-steelLight border-r-transparent border-t-steelLight" />
              </span>
            </span>
          ))}
        </div>
      </div>
      {/*
        No `min-h` here. It reserved 100px so the block wouldn't resize when a
        book is picked, and what that bought at rest was a paragraph of dead
        space under the caption. The resize now happens on a click, which is
        the reader's own action rather than a permanent cost paid to avoid it.
      */}
      <div className="mt-6">
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
          <p className="t-meta text-center">Recent reads</p>
        )}
      </div>
    </div>
  );
}
