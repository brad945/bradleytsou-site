import type { FeaturedRepo } from "@/lib/github";
import { projects, roles } from "@/lib/profile-data";

/**
 * Steam's "Favorite Game" slot.
 *
 * Driven by the live repo rather than hand-written copy: the description here
 * once said "competitive programming platform", which the repo itself had long
 * since contradicted. Pulling it from GitHub means it can't go stale.
 *
 * Deliberately compact. Earlier passes had a 184x87 capsule holding a
 * two-letter monogram and a 48px commit count in its own padded box — a lot of
 * furniture around a name, a sentence and one number. Steam's capsule works
 * because it's real cover art; a monogram in a big empty box is just space.
 *
 * Falls back to the `profile-data` entry when there's no token, so the panel
 * never empties. Tags stay hand-curated — the API has no equivalent.
 */
export function FavoriteProject({ repo }: { repo: FeaturedRepo | null }) {
  /*
   * Matched on ghRepo, and roles are searched too — DevEval is a role now, not
   * a project, so a projects-only lookup would fall through to whichever entry
   * happened to be first and show the wrong name against DevEval's repo data.
   */
  const entry = repo
    ? (projects.find((p) => p.ghRepo === repo.nameWithOwner) ??
      roles.find((r) => r.ghRepo === repo.nameWithOwner))
    : undefined;
  if (!entry && !repo) return null;

  // A role is keyed on `org`/`url`, a project on `name`/`href`.
  const isRole = !!entry && "org" in entry;
  const name = isRole ? entry.org : (entry?.name ?? repo?.name ?? "");
  const period = isRole ? undefined : entry?.period;
  const entryLink = isRole ? entry.url : entry?.href;

  const blurb = repo?.description ?? entry?.blurb ?? "";
  const tags = entry?.tags ?? [];
  const link = repo && !repo.isPrivate ? repo.url : entryLink;

  return (
    <section aria-labelledby="favorite-heading" className="panel">
      <div className="panel-bar">
        <h2 id="favorite-heading" className="panel-bar-title">
          Favorite Project
        </h2>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-[19px] font-light leading-tight text-bright">
            {name}
          </h3>
          <span className="t-meta">
            {[repo?.language, period].filter(Boolean).join(" · ")}
          </span>
        </div>

        <p className="t-body mt-1.5">{blurb}</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="border border-line bg-panel2/60 px-1.5 py-0.5 font-mono text-[10px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>

          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="steam-link shrink-0 text-[14px]"
            >
              {repo && !repo.isPrivate ? "View source" : "Visit"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
