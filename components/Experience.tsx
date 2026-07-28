import { monogram, roles, type Role } from "@/lib/profile-data";

/**
 * Steam's "recently played" row shape, reused for jobs.
 *
 * Hand-maintained rather than fetched — LinkedIn has no public API. That makes
 * this the one panel on the page whose contents can go stale silently, so it's
 * kept verbatim from the source rather than paraphrased.
 */
function RoleRow({ role }: { role: Role }) {
  const period = `${role.start} — ${role.end ?? "Present"}`;

  const org = role.url ? (
    <a
      href={role.url}
      target="_blank"
      rel="noreferrer"
      className="steam-link text-[17px] font-light leading-tight"
    >
      {role.org}
    </a>
  ) : (
    <span className="text-[17px] font-light leading-tight text-bright">
      {role.org}
    </span>
  );

  return (
    <li className="flex flex-col gap-3 bg-base/45 p-3 sm:flex-row">
      <div className="flex h-[60px] w-full shrink-0 items-center justify-center border border-line/70 bg-panel2/70 sm:h-[60px] sm:w-[60px]">
        <span className="text-[18px] font-light leading-none text-muted">
          {monogram(role.org)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          {org}
          {/*
            One line, always. Location used to sit on a second line here, so
            cards with one wrapped differently from cards without — most
            visibly on MedImpact, whose long org name pushed the block around.
            It lives with the title instead.
          */}
          <p className="t-meta shrink-0 leading-tight">{period}</p>
        </div>

        <p className="mt-0.5 text-[15px] leading-snug text-copy">
          {role.title}
          {role.location && <span className="t-meta"> · {role.location}</span>}
        </p>
        {role.blurb && (
          <p className="t-meta mt-1.5 leading-relaxed">{role.blurb}</p>
        )}
      </div>
    </li>
  );
}

export default function Experience() {
  if (roles.length === 0) return null;

  const current = roles.filter((r) => !r.end).length;

  return (
    <section aria-labelledby="experience-heading" className="panel">
      <div className="panel-bar">
        <h2 id="experience-heading" className="panel-bar-title">
          Experience
        </h2>
        <span className="panel-bar-meta">
          {roles.length} roles · {current} current
        </span>
      </div>

      <div className="p-5">
        <ul className="flex flex-col gap-3">
          {roles.map((role) => (
            <RoleRow key={`${role.org}-${role.title}`} role={role} />
          ))}
        </ul>
      </div>
    </section>
  );
}
