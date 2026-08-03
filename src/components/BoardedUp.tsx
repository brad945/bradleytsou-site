/**
 * The board laid over the profile grid while `privacyScreen` is on.
 *
 * It is exactly one thing: a rectangle covering the block below the header.
 * It doesn't remove sections, edit copy, or change any component's props —
 * the grid underneath renders as it always did and this sits on top of it.
 * Turning the flag off removes this element and nothing else moves.
 *
 * **It is a visual cover, not a redaction.** Everything behind it is still in
 * the page source, because leaving the grid untouched is the point. If the
 * repo names, commit counts and roles need to be genuinely unreachable, this
 * is the wrong tool — that needs the sections not rendered at all.
 *
 * The plywood is Bradley's ask for something with more character than a grey
 * box, and the plank colour is sampled from the boarded storefront behind him
 * in `avatar.jpg`, so it sits with the photo above rather than against it.
 * Nothing animates and there are no gradients: flat fills with a light and a
 * dark edge, the same bevel vocabulary as the avatar frame's `frameHi` /
 * `frameLo`.
 */

/**
 * One nailed plank.
 *
 * Two numbers are load-bearing here and both were wrong on the first pass:
 *
 *  - **The overhang is small (3%).** A rotated rectangle's vertical extent is
 *    `width x sin(angle) + height`, so a board hanging far past the opening
 *    gains height fast from even a few degrees, runs off the top or bottom and
 *    gets clipped into a wedge — it stops reading as a board at all.
 *  - **The nails sit inside that overhang.** At the first pass's 8% they were
 *    driven past the edge and clipped away, leaving boards with no fixings.
 *    Nail inset must exceed the overhang or they simply aren't there.
 *
 * The angles are also tied to the panel's width for the same reason: these are
 * set for the full ~966px column, where even 4deg drops 67px.
 */
function Plank({ top, rotate }: { top: string; rotate: string }) {
  return (
    <div
      className="absolute left-[-3%] right-[-3%] border-2 border-b-plankLo border-l-plankHi border-r-plankLo border-t-plankHi bg-plank"
      style={{ top, transform: `rotate(${rotate})` }}
    >
      <div className="flex h-[46px] items-center justify-between px-14">
        <NailPair />
        <NailPair />
      </div>
    </div>
  );
}

/** A nail head — the one cool note on the boards, so it reads as metal. */
function Nail() {
  return (
    <span className="block h-[7px] w-[7px] rounded-full border border-plankLo bg-nail" />
  );
}

/** The two nails at one end of a plank, as they'd actually be driven. */
function NailPair() {
  return (
    <span className="flex flex-col gap-[9px]">
      <Nail />
      <Nail />
    </span>
  );
}

export default function BoardedUp() {
  return (
    /*
      `inset-0` over the grid's own relative wrapper, so the cover is exactly
      the height of what it covers — no fixed height to keep in sync as the
      sections below it change.

      aria-hidden because it's scenery: the sign carries no information a
      screen reader needs, and the content behind is what actually has meaning.
    */
    <div
      aria-hidden
      className="absolute inset-0 z-10 overflow-hidden rounded-panel bg-base"
    >
      {/*
        Three boards, not two. Two read as a drawn X; three, unevenly spaced at
        unequal angles, read as something someone nailed up.
      */}
      <Plank top="14%" rotate="-2.4deg" />
      <Plank top="46%" rotate="1.5deg" />
      <Plank top="76%" rotate="-1.2deg" />

      {/*
        The sign hangs over the middle board, tilted against it so it reads as
        a separate object nailed on rather than part of the board.

        Uppercase mono is the one place this site allows tracked capitals —
        `.label`, scoped to chrome. A hand-painted sign is that kind of object,
        so it earns it here and nowhere else.
      */}
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="rotate-[-1.5deg] border border-line bg-panel2 px-10 py-6 shadow-[0_2px_0_rgba(0,0,0,0.5)]">
          <p className="label text-[13px] tracking-[0.22em] text-accent">
            Coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
