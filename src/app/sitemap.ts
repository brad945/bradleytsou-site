import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/profile-data";

/**
 * The profile page and `/play`.
 *
 * `/play` is listed at a low priority because it's deliberately near-empty
 * right now — it should be findable, not competing with the profile for
 * relevance. Raise it when there's something on it.
 *
 * `lastModified` is left off throughout rather than stamped with the build
 * time: content changes when Bradley commits, not when the site rebuilds, so a
 * build timestamp would tell crawlers something had changed on deploys where
 * nothing did.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteOrigin, changeFrequency: "daily", priority: 1 },
    { url: `${siteOrigin}/play`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
