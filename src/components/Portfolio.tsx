import { Row } from "@/components/Experience";
import type { FeaturedRepo } from "@/lib/github";
import { projects, type Project } from "@/lib/profile-data";

/**
 * Portfolio — the built things, on `/about`.
 *
 * **These rows used to live in Experience & Projects on `/`**, and moved here
 * at Bradley's request. The two pages now split along a cleaner line than
 * before: `/` is the record an employer reads — roles, dates, orgs, who he
 * worked for — and `/about` is everything he made or likes, which is what a
 * portfolio is.
 *
 * It shares `Row` with Experience rather than restyling. The row shape is
 * Steam's "recently played" line and it's the one piece of layout both panels
 * genuinely have in common; two copies of it would drift the first time either
 * page was touched.
 *
 * Order is manual, as it is everywhere on this site — rendered in the order
 * they're authored in `profile-data`. A date sort was tried on the old merged
 * panel and reverted within the hour; the reasoning is recorded there and it
 * applies here too.
 */

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
      /*
       * Both halves are optional now. `period` is unset on an entry whose
       * dates nobody has confirmed and `language` is absent until the repo is
       * in `featuredRepos`, so this can legitimately come out empty — which
       * renders as nothing rather than as a stray separator.
       */
      meta={[project.period, repo?.language].filter(Boolean).join(" · ")}
    />
  );
}

export default function Portfolio({ featured }: { featured: FeaturedRepo[] }) {
  const byRepo = new Map(featured.map((r) => [r.nameWithOwner, r]));

  return (
    <section aria-labelledby="portfolio-heading" className="panel">
      <div className="panel-bar">
        <h2 id="portfolio-heading" className="panel-bar-title">
          Portfolio
        </h2>
      </div>

      <div className="px-5 pb-5 pt-1">
        <ul className="flex flex-col">
          {projects.map((project) =>
            projectRow(
              project,
              project.ghRepo ? byRepo.get(project.ghRepo) : undefined,
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
