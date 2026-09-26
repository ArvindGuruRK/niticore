import type { MetadataRoute } from "next";
import { PAGES, SITE_URL, type PagePath } from "@/lib/site";

/**
 * /sitemap.xml: every public page, from the same list as the page metadata. The internal
 * /design-system is left out (it is noindex). lastModified is the build time.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return (Object.keys(PAGES) as PagePath[]).map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/demo" ? 0.6 : 0.8,
  }));
}
