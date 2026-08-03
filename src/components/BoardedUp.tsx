import { profile } from "@/lib/profile-data";

/**
 * The boarded-up panel that stands in for the parked sections while
 * `privacyScreen` is on.
 *
 * It's a real board, not a spinner or a "coming soon" splash: plywood nailed
 * across the opening, with a sign hung on it. The motif isn't arbitrary —
 * the storefront behind Bradley in `avatar.jpg` is boarded exactly like this,
 * and the plank colour is sampled from it, so the panel reads as continuous
 * with the photo six inches above it rather than as a widget.
 *
 * Three things keep it inside the site's own rules:
 *
 *  1. **Nothing here animates.** The brief is no decorative motion, and a
 *     placeholder is the most tempting place to break that. The boards are
 *     static; the only thing that moves on this page is still the avatar's
 *     DVD logo and the status pulse, both of which replicate real features.
 *  2. **No gradients.** The planks are flat fills with a light top-left edge
 *     and a dark bottom-right one — the same bevel vocabulary as the avatar
 *     frame (`frameHi` / `frameLo`). Wood grain would need a repeating
 *     gradient and would have been the fourth `backgroundImage` in a config
 *     that deliberately has two.
 *  3. **It says what it is.** "Coming soon" alone is the fake chrome this
 *     site avoids — it implies work that may not exist. The sign names the
 *     sections that are behind it and the reason, and points at the parts of
 *     the profile that *are* live, so a visitor who came for the work still
 *     has somewhere to go.
 *
 * The planks are `aria-hidden` and the sign carries the text, so a screen
 * reader gets the sentence without the scenery.
 */

/**
 * The sections this board is standing in front of, named on the sign. The
 * boards cover the whole grid, both columns, so this includes the sidebar's
 * blocks and not just the main column's.
 */
const BEHIND_THE_BOARDS = [
  "Projects",
  "Experience",
  "Activity",
  "GitHub stats",
];

/**
 * One nailed plank. `top` and `rotate` are per-board rather than derived — a
 * set at matching angles reads as a graphic, and the point is that someone
 * hammered these up.
 *
 * Two numbers here are load-bearing and were both wrong on the first pass:
 *
 *  - **The overhang is small (3%).** A rotated rectangle's vertical extent is
 *    `width x sin(angle) + height`, so a board that hangs far past the opening
 *    gains a lot of height from even a few degrees, runs off the top or bottom
 *    of the well, and gets clipped into a wedge — it stops reading as a board
 *    at all. Overhang and angle have to be kept down together.
 *  - **The nails sit at `px-14`, inside that overhang.** At the first pass's
 *    8% overhang they were driven past the well's edge and clipped away
 *    entirely, so the boards had no visible fixings. Nail inset must exceed
 *    the overhang, or they aren't there.
 */
function Plank({
  top,
  rotate,
}: {
  top: string;
  rotate: string;
}) {
  return (
    <div
      aria-hidden
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

/** A nail head. Two per plank end, as they'd actually be driven. */
function Nail() {
  return (
    <span
      aria-hidden
      className="block h-[7px] w-[7px] rounded-full border border-plankLo bg-nail"
    />
  );
}

/** The pair of nails at one end of a plank. */
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
    <section aria-labelledby="boarded-heading" className="panel">
      <div className="panel-bar">
        <h2 id="boarded-heading" className="panel-bar-title">
          Under Construction
        </h2>
        <span className="panel-bar-meta">Back soon</span>
      </div>

      {/*
        `bg-base` is the page black, so the opening behind the boards reads as a
        dark interior rather than as another panel. The height is fixed rather
        than driven by the sign: the boards are positioned in percentages, so a
        box that grew with its content would slide them around and change the
        composition every time the copy was edited.
      */}
      <div className="relative h-[420px] overflow-hidden bg-base px-5 sm:h-[400px]">
        {/*
          Three boards, not two. Two read as a cross or an X — a shape someone
          drew. Three, unevenly spaced at unequal angles, read as boards someone
          nailed up, which is the whole difference.
        */}
        {/*
          Angles are shallower than they look like they should be because this
          panel spans the full ~966px column. Rise is `width x sin(angle)`, so
          the same 4deg that read as a gentle tilt in the 649px main column
          becomes a 67px drop here — steep enough to run the boards out of the
          well. Widening the panel means flattening these.
        */}
        <Plank top="10%" rotate="-2.4deg" />
        <Plank top="44%" rotate="1.5deg" />
        <Plank top="77%" rotate="-1.2deg" />

        {/*
          The sign hangs over the middle board, tilted against it so it reads as
          a separate object nailed on top rather than part of the board. Capped
          well short of the column so the boards stay visible either side —
          a sign that spans the opening covers them and the scene collapses
          into a card on a brown background.
        */}
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-[440px] rotate-[-1.5deg] border border-line bg-panel2 px-7 py-6 text-center shadow-[0_2px_0_rgba(0,0,0,0.5)]">
            {/*
              Uppercase mono is the one place this site allows tracked capitals
              — `.label`, scoped to chrome. A hand-painted sign is the same kind
              of object, so it earns it here and nowhere else.
            */}
            <p className="label text-accent">Coming soon</p>

            <p className="mt-3 text-[15px] leading-relaxed text-copy">
              {BEHIND_THE_BOARDS.join(", ")} are boarded up while{" "}
              {profile.name.split(" ")[0]} finishes them.
            </p>

            {/*
              This used to say the status block above was still live. It isn't
              — the boards now cover the sidebar too, so that line was claiming
              something a visitor could see wasn't there. Points at Message
              instead, which is the only way through while this is up: the
              Links panel is behind the boards with everything else.
            */}
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Use Message above to get in touch in the meantime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
