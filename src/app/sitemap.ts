import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/profile-data";

/**
 * One entry, because the site is one page.
 *
 * `lastModified` is left off deliberately rather than stamped with the build
 * time: the page's content changes when Bradley commits, not when the site
 * rebuilds, so a build timestamp would tell crawlers it had changed on deploys
 * where nothing did.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteOrigin, changeFrequency: "daily", priority: 1 }];
}
