import type { FeaturedRepo } from "@/lib/github";
import { projects, roles, type Project, type Role } from "@/lib/profile-data";

/**
 * Work history and projects in one panel.
 *
 * They were two panels and split the same story in half — where he worked
 * versus what he built — with UCSB and BRI Youth appearing in both. Merged,
 * and the duplicated entries were folded together rather than dropped: what
 * the standalone project rows carried (the tags, the framing) now lives on the
 * role, so one entry holds everything known about it.
 *
 * Order is manual on both lists, not sorted: Bradley wants MedImpact above
 * Crossing Hurdles even though it started a month earlier, so sorting by date
 * would fight him.
 */
function Row({
  title,
  meta,
  subtitle,
  blurb,
  tags,
  href,
  isPrivate = false,
}: {
  title: string;
  meta: string;
  subtitle?: string;
  blurb?: string;
  tags?: string[];
  href?: string;
  /** Shows a Private tag. Set when the backing repo isn't publicly visible. */
  isPrivate?: boolean;
}) {
  return (
    <li className="flex flex-col gap-x-6 gap-y-1 border-t border-line/50 py-3 sm:flex-row">
      <div className="min-w-0 sm:w-[190px] sm:shrink-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="steam-link text-[15px]"
          >
            {title}
          </a>
        ) : (
          <span className="text-[15px] text-copy">{title}</span>
        )}
        {/*
          Marks a project whose repo a visitor can't open. It's shown instead
          of a link rather than beside one — the point is that there's nothing
          to click, not that the link is restricted.
        */}
        {isPrivate && (
          <span className="ml-2 border border-line px-1.5 py-px text-[10px] uppercase tracking-wider text-muted">
            Private
          </span>
        )}
        {subtitle && <p className="t-meta leading-snug">{subtitle}</p>}
      </div>

      <div className="min-w-0 flex-1">
        {blurb && <p className="t-meta leading-snug">{blurb}</p>}
        {tags && tags.length > 0 && (
          <p className="mt-1 font-mono text-[10px] text-muted/60">
            {tags.join(" · ")}
          </p>
        )}
      </div>

      {/*
        Dates for a role, period + language for a project. The commit count
        that used to sit under this was removed at Bradley's request — the
        `stat` slot went with it rather than being left empty, since an unused
        prop reads as something that broke.
      */}
      <div className="t-meta shrink-0 leading-snug sm:w-[132px] sm:text-right">
        <p>{meta}</p>
      </div>
    </li>
  );
}

function roleRow(role: Role, repo?: FeaturedRepo) {
  return (
    <Row
      key={`role-${role.org}-${role.title}`}
      title={role.org}
      href={role.url}
      subtitle={[role.title, role.location].filter(Boolean).join(" · ")}
      blurb={role.blurb}
      tags={role.tags}
      meta={`${role.start} — ${role.end ?? "Present"}`}
    />
  );
}

function projectRow(project: Project, repo?: FeaturedRepo) {
  const href =
    project.href ??
    project.repo ??
    (repo && !repo.isPrivate ? repo.url : undefined);

  /*
   * A project with a backing repo the API reports private, and no other link,
   * has nothing a visitor can open — so it gets the tag instead. `repo` is only
   * populated for repos in `featuredRepos`, so a private one outside that list
   * shows neither, which is correct: nothing here knows it exists.
   */
  const isPrivate = !href && Boolean(repo?.isPrivate);

  return (
    <Row
      key={`project-${project.id}`}
      title={project.name}
      href={href}
      isPrivate={isPrivate}
      subtitle={project.kind}
      blurb={project.blurb}
      tags={project.tags}
      meta={[project.period, repo?.language].filter(Boolean).join(" · ")}
    />
  );
}

export default function Experience({ featured }: { featured: FeaturedRepo[] }) {
  const byRepo = new Map(featured.map((r) => [r.nameWithOwner, r]));

  /*
   * Rendered in the order they're authored in `profile-data`, deliberately.
   * A date sort lived here briefly and was reverted: Bradley wants Crossing
   * Hurdles below DevEval despite starting five months later, which is
   * exactly the placement sorting by date can't express.
   */
  return (
    <section aria-labelledby="experience-heading" className="panel">
      <div className="panel-bar">
        <h2 id="experience-heading" className="panel-bar-title">
          Experience &amp; Projects
        </h2>
      </div>

      <div className="px-5 pb-5 pt-1">
        <ul className="flex flex-col">
          {roles
            .filter((role) => !role.hidden && !role.afterProjects)
            .map((role) =>
              roleRow(role, role.ghRepo ? byRepo.get(role.ghRepo) : undefined),
            )}
          {projects.map((project) =>
            projectRow(
              project,
              project.ghRepo ? byRepo.get(project.ghRepo) : undefined,
            ),
          )}
          {/*
            Roles flagged `afterProjects` close the list. The panel is one
            merged list but was built as roles-then-projects, which tied a
            role's position to its category — BRI Youth could only ever be last
            among the roles, never last overall.
          */}
          {roles
            .filter((role) => !role.hidden && role.afterProjects)
            .map((role) =>
              roleRow(role, role.ghRepo ? byRepo.get(role.ghRepo) : undefined),
            )}
        </ul>
      </div>
    </section>
  );
}
