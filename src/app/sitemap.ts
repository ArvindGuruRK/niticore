import type { MetadataRoute } from "next";
import { getPublishedSlugs } from "@/lib/cms";
import { SECTIONS, type SectionKey } from "@/lib/posts";
import { LEGAL_PAGES, PAGES, SITE_URL, type PagePath } from "@/lib/site";

const isLegal = (path: PagePath) => (LEGAL_PAGES as readonly PagePath[]).includes(path);

// Rebuilt whenever a post is published (cms/hooks/revalidate.ts); hourly as a fallback
export const revalidate = 3600;

/**
 * /sitemap.xml: every public page, from the same list as the page metadata, then every published
 * blog and news post (dated by its last change). The internal /design-system is left out (it is
 * noindex). A page's lastModified is the build time.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = (Object.keys(PAGES) as PagePath[]).map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: isLegal(path) ? "yearly" : path === "/blog" || path === "/news" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : isLegal(path) ? 0.3 : path === "/demo" ? 0.6 : 0.8,
  }));

  const posts = await Promise.all(
    (Object.keys(SECTIONS) as SectionKey[]).map(async (key) =>
      (await getPublishedSlugs(key)).map(({ slug, updatedAt }) => ({
        url: `${SITE_URL}${SECTIONS[key].path}/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ),
  );

  return [...pages, ...posts.flat()];
}
