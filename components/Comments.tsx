"use client";

import { useEffect, useRef } from "react";

/**
 * giscus-backed comments — real GitHub Discussions, not a fake widget.
 *
 * NOT wired into app/page.tsx yet. Before importing it:
 *   1. Enable Discussions on the repo (Settings → Features → Discussions).
 *   2. Install the giscus app: https://github.com/apps/giscus
 *   3. Go to https://giscus.app, enter the repo, and copy the generated
 *      `data-repo-id` and `data-category-id` into GISCUS below.
 *
 * Until those IDs are real, giscus renders an error box — which is why the
 * import in app/page.tsx stays commented out.
 */
const GISCUS = {
  repo: "your-github-username/bradleytsou-site", // TODO(bradley)
  repoId: "REPLACE_WITH_DATA_REPO_ID", // TODO(bradley): from giscus.app
  category: "General",
  categoryId: "REPLACE_WITH_DATA_CATEGORY_ID", // TODO(bradley): from giscus.app
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
    <section aria-labelledby="comments-heading" className="panel bg-panel-sheen p-5 sm:p-6">
      <h2 id="comments-heading" className="font-display text-lg font-medium tracking-tight">
        Comments
      </h2>
      <p className="mt-1 text-xs text-muted">
        Backed by GitHub Discussions. Sign in with GitHub to post.
      </p>
      <div ref={container} className="mt-4" />
    </section>
  );
}
