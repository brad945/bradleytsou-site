import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/profile-data";

/**
 * Everything is public and there's one page, so this allows all rather than
 * pretending to have rules. Its real job is pointing crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
