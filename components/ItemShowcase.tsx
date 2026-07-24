import {
  projects,
  rarityLabels,
  rarityStyles,
  type Project,
  type Rarity,
} from "@/lib/profile-data";

const TIER_ORDER: Rarity[] = ["core", "major", "side"];

function ProjectCard({ project }: { project: Project }) {
  const style = rarityStyles[project.rarity];
  const link = project.href ?? project.repo;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-medium tracking-tight text-ink">
          {project.name}
        </h3>
        <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] ${style.text}`}>
          {rarityLabels[project.rarity]}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">{project.blurb}</p>

      <ul className="mb-4 mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-sm border border-line bg-base px-1.5 py-0.5 font-mono text-[10px] text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>

      {/* mt-auto pins the footer to the bottom so footers line up across the row. */}
      <div className="mt-auto flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span>{project.period}</span>
        <span className={link ? "text-ink/70" : "text-muted/60"}>
          {project.href ? "Visit ↗" : project.repo ? "Source ↗" : "Private"}
        </span>
      </div>
    </>
  );

  const shell =
    "group relative flex h-full flex-col rounded-panel border border-l-2 border-line bg-panel p-4 transition-colors";

  if (!link) {
    return <li className={`${shell} ${style.border} ${style.tint}`}>{body}</li>;
  }

  return (
    <li className="h-full">
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={`${shell} ${style.border} ${style.tint} hover:border-y-line hover:border-r-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
      >
        {body}
      </a>
    </li>
  );
}

export default function ItemShowcase() {
  return (
    <section aria-labelledby="showcase-heading" className="panel bg-panel-sheen p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 id="showcase-heading" className="font-display text-lg font-medium tracking-tight">
            Item Showcase
          </h2>
          <p className="mt-1 text-xs text-muted">
            Rarity = how central the project is to my work. Not how shiny it is.
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-3">
          {TIER_ORDER.map((tier) => (
            <li key={tier} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${rarityStyles[tier].dot}`}
                aria-hidden
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {rarityLabels[tier]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </ul>
    </section>
  );
}
