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
        Uppercase mono is the one place this site allows tracked capitals —
        `.label`, scoped to chrome. Signage is that kind of object, so it earns
        it here and nowhere else.
      */}
      <p className="label text-[13px] tracking-[0.22em] text-accent">
        Coming soon
      </p>
    </div>
  );
}
