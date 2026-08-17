"use client";

import { useEffect, useRef } from "react";
import { githubUsername, SITE_REPO_NAME } from "@/lib/profile-data";

/**
 * giscus-backed comments — real GitHub Discussions, not a fake widget.
 *
 * The whole thread lives on `brad945/bradleytsou-site`; visitors sign in with
 * their own GitHub account and their comments are real discussion replies.
 * Nothing is stored here, which is the point — the site has no backend, and a
 * comment box that pretended to work would be exactly the fake chrome this
 * page avoids.
 *
 * ## The ids
 *
 * `repoId` and `categoryId` are GitHub's GraphQL node ids, read off the API
 * rather than copied out of giscus.app — the same values that page generates.
 * They're **not secret**: giscus is a client-side script, so every visitor
 * receives them. They only identify which repo and category to post into.
 *
 * The category is **Announcements**, and the type matters more than the name:
 * only maintainers can open discussions in an Announcement-format category, so
 * a stranger can't create one for giscus to then adopt as a page's thread.
 * `data-strict` narrows that further. Swapping to a dedicated "Comments"
 * category later is a one-line id change.
 *
 * ## What it maps to
 *
 * `data-mapping="pathname"` means one discussion per path — and this is
 * effectively a one-page site, so in practice it's **a single guestbook
 * thread**, not per-post comments. That's the right shape here; don't expect
 * threads to multiply.
 *
 * If it renders an error box, the giscus app isn't installed on the repo:
 * https://github.com/apps/giscus
 */
const GISCUS = {
  // Derived, so it can't drift from the repo the rest of the page links to.
  repo: `${githubUsername}/${SITE_REPO_NAME}`,
  repoId: "R_kgDOTirmOQ",
  category: "Announcements",
  categoryId: "DIC_kwDOTirmOc4DDlm4",
} as const;

export default function Comments() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = container.current;
    if (!el || el.firstChild) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", GISCUS.repo);
    script.setAttribute("data-repo-id", GISCUS.repoId);
    script.setAttribute("data-category", GISCUS.category);
    script.setAttribute("data-category-id", GISCUS.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "transparent_dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");

    el.appendChild(script);
  }, []);

  return (
    /*
      Panel bar, like every other section. This was written before the Steam
      typography scale existed and still carried `font-display text-lg
      font-medium tracking-tight` — a heading style used nowhere else on the
      page, which would have landed looking like a different site.
    */
    <section aria-labelledby="comments-heading" className="panel">
      <div className="panel-bar">
        <h2 id="comments-heading" className="panel-bar-title">
          Comments
        </h2>
        <span className="panel-bar-meta">GitHub Discussions</span>
      </div>

      <div className="p-5">
        <p className="t-meta">Sign in with GitHub to post.</p>
        <div ref={container} className="mt-4" />
      </div>
    </section>
  );
}
