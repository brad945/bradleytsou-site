import type { FeaturedRepo } from "@/lib/github";
import {
  monogram,
  projects,
  rarityLabels,
  rarityStyles,
  type Project,
  type Rarity,
} from "@/lib/profile-data";

const TIER_ORDER: Rarity[] = ["core", "major", "side"];

function tileTitle(project: Project): string {
  const tags = project.tags.length ? ` · ${project.tags.join(", ")}` : "";
  return `${project.name} — ${project.blurb}${tags}`;
}

/**
 * Steam's "Favorite Game" slot, given to CodeArena.
 *
 * Driven by the live repo rather than hand-written copy: the description here
 * used to say "competitive programming platform", which the repo itself had
 * long since contradicted. Pulling it from GitHub means it can't go stale.
 *
 * Falls back to the `profile-data` entry when there's no token, so the panel
 * never empties. Tags stay hand-curated — the API has no equivalent.
 */
export function FavoriteProject({ repo }: { repo: FeaturedRepo | null }) {
  // Match on the repo name so changing FAVORITE_REPO is a one-line edit.
  const entry =
    (repo && projects.find((p) => p.id === repo.name.toLowerCase())) ??
    projects.find((p) => p.rarity === "core") ??
    projects[0];
  if (!entry && !repo) return null;

  const style = rarityStyles[entry?.rarity ?? "core"];
  const name = entry?.name ?? repo?.name ?? "";
  const blurb = repo?.description ?? entry?.blurb ?? "";
  const tags = entry?.tags ?? [];

  return (
    <section aria-labelledby="favorite-heading" className="panel">
      <div className="panel-bar">
        <h2 id="favorite-heading" className="panel-bar-title">
          Favorite Project
        </h2>
        {/* No uppercase or tracking — Steam's panel bars use plain sentence case. */}
        <span className={`text-[15px] font-light ${style.text}`}>
          {rarityLabels[entry?.rarity ?? "core"]}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Capsule — generated from the palette, not lifted art. */}
          <div
            className={`flex h-[87px] w-full shrink-0 items-center justify-center border-l-2 bg-base/60 sm:w-[184px] ${style.border}`}
          >
            <span
              className={`text-[30px] font-light leading-none ${style.text}`}
            >
              {monogram(name)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[19px] font-light leading-tight text-bright">
              {name}
            </h3>
            <p className="t-body mt-1.5">{blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-line bg-base/50 px-1.5 py-0.5 font-mono text-[10px] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          Steam's oversized "Hours played" stat. Here it's commits contributed —
          "of N" so a shared repo can't read as sole authorship.
        */}
        <div className="mt-4 bg-base/40 p-4">
          {repo ? (
            <>
              <p className="t-stat-lg">{repo.myCommits.toLocaleString()}</p>
              <p className="t-label mt-1.5">Commits contributed</p>
            </>
          ) : (
            <>
              <p className="t-stat-lg text-[34px]">{entry?.period}</p>
              <p className="t-label mt-1.5">In development</p>
            </>
          )}
        </div>

        {repo && !repo.isPrivate && (
          <div className="mt-3 flex justify-end border-t border-line/60 pt-3">
            <a
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="steam-link text-[14px]"
            >
              View source
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Tile({ project }: { project: Project }) {
  const style = rarityStyles[project.rarity];
  const link = project.href ?? project.repo;

  const inner = (
    <>
      <span className={`text-[22px] font-light leading-none ${style.text}`}>
        {monogram(project.name)}
      </span>
      <span className="mt-1.5 line-clamp-2 px-1 text-center text-[11px] leading-tight text-muted">
        {project.name}
      </span>
    </>
  );

  const shell =
    "flex aspect-square w-full flex-col items-center justify-center border bg-base/55 transition-colors";

  if (!link) {
    return (
      <li title={tileTitle(project)} className={`${shell} ${style.tileBorder}`}>
        {inner}
      </li>
    );
  }

  return (
    <li title={tileTitle(project)}>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={`${shell} ${style.tileBorder} ${style.tint} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
      >
        {inner}
      </a>
    </li>
  );
}

export default function ItemShowcase() {
  return (
    <section aria-labelledby="showcase-heading" className="panel">
      <div className="panel-bar">
        <h2 id="showcase-heading" className="panel-bar-title">
          Item Showcase
        </h2>
        <ul className="flex flex-wrap items-center gap-3">
          {TIER_ORDER.map((tier) => (
            <li key={tier} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 ${rarityStyles[tier].dot}`}
                aria-hidden
              />
              <span className="t-meta">{rarityLabels[tier]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {projects.map((project) => (
            <Tile key={project.id} project={project} />
          ))}

          {/* Steam puts the "N Items Owned" counter in the grid's leftover space. */}
          <li className="col-span-2 flex flex-col justify-center px-2 lg:col-span-3">
            <span className="t-stat-lg">{projects.length}</span>
            <span className="t-label mt-1">Projects Shown</span>
          </li>
        </ul>

        <p className="t-meta mt-3">
          Rarity is how central the project is to my work — not how shiny it is.
        </p>

        {/*
          A monogram tile isn't self-describing the way Steam's item art is, and
          `title` never fires on touch. The detail list is always rendered.
        */}
        <ul className="mt-3 flex flex-col divide-y divide-line/50 border-t border-line/50">
          {projects.map((project) => {
            const style = rarityStyles[project.rarity];
            const link = project.href ?? project.repo;

            return (
              <li key={project.id} className="py-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={`h-2 w-2 shrink-0 ${style.dot}`}
                    aria-hidden
                  />
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="steam-link text-[13px]"
                    >
                      {project.name}
                    </a>
                  ) : (
                    <span className="text-[13px] text-copy">
                      {project.name}
                    </span>
                  )}
                  <span className="t-meta">{project.period}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted/60">
                    {project.tags.join(" · ")}
                  </span>
                </div>
                <p className="t-meta mt-0.5 pl-4 leading-snug">
                  {project.blurb}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
