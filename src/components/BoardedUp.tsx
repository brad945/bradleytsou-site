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

/** The sections this board is standing in front of, named on the sign. */
const BEHIND_THE_BOARDS = ["Favorite Project", "Experience", "Recent Activity"];

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
        <Plank top="9%" rotate="-4deg" />
        <Plank top="43%" rotate="2.5deg" />
        <Plank top="76%" rotate="-2deg" />

        {/*
          The sign hangs over the middle board, tilted against it so it reads as
          a separate object nailed on top rather than part of the board. Narrow
          enough that the boards stay visible either side of it — at 420 in this
          column it covered them and the scene collapsed into a card on a brown
          background.
        */}
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <div className="w-full max-w-[360px] rotate-[-1.5deg] border border-line bg-panel2 px-6 py-5 text-center shadow-[0_2px_0_rgba(0,0,0,0.5)]">
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

            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              The profile above is live and fetching — status, counts and
              activity are all real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
