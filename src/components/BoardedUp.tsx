/**
 * The "Coming soon" cover, rendered in place of the profile grid while
 * `privacyScreen` is on.
 *
 * It replaces that block rather than sitting on top of it. An overlay was
 * tried first and couldn't hold: it lived inside the clipped wrapper, so an
 * anchor jump from the nav scrolled the container and carried the cover off
 * with it, and every link underneath stayed in the tab order however opaque
 * the thing painted over it was. Covering pixels doesn't disable a document.
 *
 * Because the grid isn't rendered, nothing behind this is reachable by click,
 * keyboard or View Source, and `page.tsx` still hands the fetched data to a
 * branch that never runs. No component below was edited to make that work —
 * the whole change is which branch renders.
 */
export default function BoardedUp() {
  return (
    <div className="mt-3 flex h-[220px] items-center justify-center rounded-panel bg-base">
      {/*
        `font-sign` is Bebas Neue, loaded in layout.tsx for this one element.
        It's a poster face and would be wrong anywhere else on the page — the
        site's own type is one family at light weights with no tracked capitals
        — but a hoarding isn't part of that page.

        The face is caps-only, so "Coming soon" renders as capitals without
        `uppercase`; the string stays sentence case so it reads normally
        anywhere the markup is read as text.
      */}
      <p className="font-sign text-[52px] leading-none tracking-[0.06em] text-bright sm:text-[64px]">
        Coming soon
      </p>
    </div>
  );
}
