import { books } from "@/lib/about-data";

/**
 * A bookshelf, hand-kept and openly so.
 *
 * **The label matters more than the list.** Books are the one thing on this
 * site with no API worth using — Goodreads shut theirs down in 2020 and
 * nothing replaced it — so this can only ever be written. The panel bar says
 * "kept by hand" for that reason: everything else here is fetched, and a
 * reader who assumes this one is too would be wrong about the only part of the
 * page that can silently go stale.
 *
 * No ratings, no star counts, no percent-complete. Those look measured, and
 * the whole point of saying "kept by hand" is not to imply measurement.
 * Status is where a book *is*, which is a fact he knows rather than a number
 * he'd have to invent.
 */

/** Status -> how it reads and how it's coloured. Only "reading" gets emphasis. */
const STATUS: Record<
  (typeof books)[number]["status"],
  { label: string; tone: string }
> = {
  reading: { label: "Reading", tone: "text-live" },
  read: { label: "Read", tone: "text-muted" },
  shelved: { label: "Shelved", tone: "text-muted/70" },
};

export default function Books() {
  const reading = books.filter((b) => b.status === "reading").length;

  return (
    <section aria-labelledby="books-heading" className="panel">
      <div className="panel-bar">
        <h2 id="books-heading" className="panel-bar-title">
          Books
        </h2>
        {/* Says it's written, not fetched — see the note above. */}
        <span className="panel-bar-meta">
          {reading > 0 ? `${reading} on the go · ` : ""}kept by hand
        </span>
      </div>

      <ul className="flex flex-col px-5">
        {books.map((book) => {
          const status = STATUS[book.status];
          return (
            <li
              key={book.title}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-line/50 py-3 first:border-t-0"
            >
              <span className="min-w-0">
                <span className="text-[15px] leading-tight text-ink">
                  {book.title}
                </span>
                <span className="t-meta"> · {book.author}</span>
                {book.note && (
                  <span className="t-meta mt-0.5 block leading-snug">
                    {book.note}
                  </span>
                )}
              </span>

              <span className={`label shrink-0 text-[10px] ${status.tone}`}>
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
