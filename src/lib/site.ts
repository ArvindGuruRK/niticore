import type { Metadata } from "next";

/** Primary pages, in nav order. The nav and the footer sitemap both read from here. */
export const NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Assessments", href: "/assessments" },
  { label: "Solutions", href: "/solutions" },
  { label: "Academy & Advisory", href: "/academy-advisory" },
] as const;

/** Page metadata: the title runs through the root layout's "%s | Niticore" template, and the
 *  Open Graph fields are restated because Next merges `openGraph` shallowly, not per field. */
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title: `${title} | Niticore`, description },
  };
}
