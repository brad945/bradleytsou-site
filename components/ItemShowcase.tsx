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
 * Steam's "Favorite Game" slot: one oversized entry with a capsule, a headline
 * stat, and room for real copy. Takes the highest-rarity project.
 */
export function FavoriteProject() {
  const featured = projects.find((p) => p.rarity === "core") ?? projects[0];
  if (!featured) return null;

  const style = rarityStyles[featured.rarity];
  const link = featured.href ?? featured.repo;

  return (
    <section aria-labelledby="favorite-heading" className="panel">
      <div className="panel-bar">
        <h2 id="favorite-heading" className="panel-bar-title">
          Favorite Project
        </h2>
        <span className={`text-[13px] uppercase tracking-wider ${style.text}`}>
          {rarityLabels[featured.rarity]}
        </span>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Capsule — generated from the palette, not lifted art. */}
          <div
            className={`flex h-[87px] w-full shrink-0 items-center justify-center border-l-2 bg-base/60 sm:w-[184px] ${style.border}`}
          >
            <span className={`text-[30px] font-light leading-none ${style.text}`}>
              {monogram(featured.name)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[19px] font-light leading-tight text-ink">{featured.name}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink/75">{featured.blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {featured.tags.map((tag) => (
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

        <div className="mt-4 bg-base/40 p-4">
          <p className="text-[34px] font-light leading-none text-ink/90">{featured.period}</p>
          <p className="mt-1.5 text-[14px] text-muted">In development</p>
        </div>

        {link && (
          <div className="mt-3 flex justify-end border-t border-line/60 pt-3">
            <a href={link} target="_blank" rel="noreferrer" className="steam-link text-[14px]">
              {featured.href ? "Visit" : "View source"}
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
      <span className="mt-1.5 line-clamp-2 px-1 text-center text-[10px] leading-tight text-muted">
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
              <span className={`h-2 w-2 ${rarityStyles[tier].dot}`} aria-hidden />
              <span className="text-[12px] uppercase tracking-wider text-ink/60">
                {rarityLabels[tier]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4">
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {projects.map((project) => (
            <Tile key={project.id} project={project} />
          ))}

          {/* Steam puts the "N Items Owned" counter in the grid's leftover space. */}
          <li className="col-span-2 flex flex-col justify-center px-2 lg:col-span-3">
            <span className="text-[40px] font-light leading-none text-ink/90">
              {projects.length}
            </span>
            <span className="mt-1 text-[15px] text-muted">Projects Shown</span>
          </li>
        </ul>

        <p className="mt-3 text-[12px] text-muted/70">
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
                  <span className={`h-2 w-2 shrink-0 ${style.dot}`} aria-hidden />
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
                    <span className="text-[13px] text-ink/85">{project.name}</span>
                  )}
                  <span className="text-[12px] text-muted/70">{project.period}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted/60">
                    {project.tags.join(" · ")}
                  </span>
                </div>
                <p className="mt-0.5 pl-4 text-[12px] leading-snug text-muted">{project.blurb}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
