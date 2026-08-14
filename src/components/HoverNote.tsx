/**
 * A hover note that appears **instantly**.
 *
 * This exists because `title` can't. The native tooltip has a
 * browser-controlled delay of roughly a second that no CSS or JS can shorten,
 * and both places this is used were asked for specifically as instant.
 *
 * `hidden` -> `block` with no transition, so it appears on the same frame the
 * pointer arrives.
 *
 * **`w-max` is load-bearing.** An absolutely positioned box shrink-to-fits
 * against its containing block, and here that's the `relative` span wrapping
 * the trigger — often only a few characters wide. Without `w-max` the note
 * collapses to that width and breaks one word per line. `max-w` then caps it
 * so a long note wraps at a sensible measure instead of running off-screen.
 *
 * ## Also load-bearing
 *
 * **The group is named (`group/note`).** Both call sites sit inside elements
 * that already use the default `group` for their own hover states — the nav's
 * profile link, and potentially anything wrapping the header card. An unnamed
 * group here would fire whenever the *parent* was hovered, which is a much
 * larger target than the thing the note belongs to.
 *
 * **The note is `aria-hidden`.** Where this sits inside a link, its text would
 * otherwise be appended to that link's accessible name — a screen reader would
 * read the label and the aside as one run-on string. The tradeoff is that the
 * note is visual-only; don't put anything here that isn't also conveyed some
 * other way.
 */
export default function HoverNote({
  note,
  children,
  align = "right",
  className = "",
}: {
  /** The text that appears on hover. Kept to one short sentence. */
  note: string;
  children: React.ReactNode;
  /** Which edge the note lines up with — pick the one away from the viewport edge. */
  align?: "left" | "right";
  /** Applied to the wrapper, so a caller can keep its own layout. */
  className?: string;
}) {
  return (
    <span className={`group/note relative ${className}`}>
      {children}
      <span
        aria-hidden
        className={`pointer-events-none absolute top-full z-40 mt-1 hidden w-max max-w-[280px] border border-line bg-menu px-2 py-1.5 text-[11px] leading-snug text-ink shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover/note:block ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {note}
      </span>
    </span>
  );
}
