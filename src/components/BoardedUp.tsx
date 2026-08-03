/**
 * The cover laid over the profile grid while `privacyScreen` is on.
 *
 * It is exactly one thing: a rectangle over the block below the header. It
 * doesn't remove sections, edit copy, or change any component's props — the
 * grid underneath renders as it always did and this sits on top of it.
 * Turning the flag off removes this element and nothing else moves.
 *
 * **It is a visual cover, not a redaction.** Everything behind it is still in
 * the page source, because leaving the grid untouched is the point. If the
 * repo names, commit counts and roles need to be genuinely unreachable, this
 * is the wrong tool — that needs the sections not rendered at all.
 */
export default function BoardedUp() {
  return (
    /*
      `inset-0` over the grid's own relative wrapper, so the cover is exactly
      the height of what it covers — no fixed height to keep in sync as the
      sections below it change.

      aria-hidden because it's a cover: the sign carries no information a
      screen reader needs, and the content behind is what actually has meaning.
    */
    <div
      aria-hidden
      className="absolute inset-0 z-10 flex items-center justify-center rounded-panel bg-base"
    >
      {/*
        `font-sign` is Bebas Neue, loaded in layout.tsx for this one element.
        It's a poster face and would be wrong anywhere else on the page — the
        site's own type is one family at light weights with no tracked capitals
        — but a hoarding isn't part of that page.

        The face is caps-only, so "Coming soon" renders as capitals without
        `uppercase`; the string stays sentence case so it reads normally
        anywhere the markup is read as text.
      */}
      <p className="font-sign text-[52px] leading-none tracking-[0.06em] text-accent sm:text-[64px]">
        Coming soon
      </p>
    </div>
  );
}
