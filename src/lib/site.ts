import type { Metadata } from "next";

/**
 * The site's public address, for anything that needs an absolute URL: metadata, and the links and
 * images inside emails. Set NEXT_PUBLIC_SITE_URL to the live domain; the Vercel address is the fallback.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://niticore.vercel.app").replace(/\/+$/, "");

/** Primary pages, in nav order. The nav and the footer sitemap both read from here. */
export const NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "Frameworks", href: "/frameworks" },
  { label: "Assessments", href: "/assessments" },
  { label: "Solutions", href: "/solutions" },
  { label: "Academy & Advisory", href: "/academy-advisory" },
] as const;

/**
 * Every public page with its title and description: one list for page metadata, the sitemap,
 * llms.txt and structured data. `title` runs through the root layout's "%s | Niticore" template.
 */
export const PAGES = {
  "/": {
    title: "Niticore | The operating layer for governed AI",
    description:
      "Continuous AI visibility, reusable compliance evidence, and agent guardrails, from first idea to production.",
  },
  "/platform": {
    title: "Platform",
    description: "One place to know, govern and prove that every AI system in your organisation is under control.",
  },
  "/frameworks": {
    title: "Frameworks",
    description:
      "One governance action, credited against the EU AI Act, ISO/IEC 42001, NIST AI RMF, GDPR and UAE regulation at once.",
  },
  "/assessments": {
    title: "Assessments",
    description:
      "Six focused AI governance assessments and a 0 to 100 Governance Readiness score, starting with a free 10-minute diagnostic.",
  },
  "/solutions": {
    title: "Solutions",
    description:
      "AI governance for industries where AI errors carry real financial, legal or human consequences, with a view for every stakeholder.",
  },
  "/academy-advisory": {
    title: "Academy & Advisory",
    description:
      "AI governance masterclasses for boards, operators and builders, and expert-led advisory that configures governance straight into Niticore.",
  },
  "/demo": {
    title: "Book a demo",
    description:
      "Book a live platform demo. Bring your AI systems and a certified AI governance specialist will show you where the gaps are.",
  },
} as const;

export type PagePath = keyof typeof PAGES;

/**
 * Metadata for an inner page: its title (through the layout's template), description, canonical URL
 * (so search engines index one address per page), and Open Graph fields, restated because Next
 * merges `openGraph` shallowly, not per field.
 */
export function pageMetadata(path: Exclude<PagePath, "/">): Metadata {
  const { title, description } = PAGES[path];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | Niticore`, description, url: path },
  };
}
