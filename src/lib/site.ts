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
  "/announcements": {
    title: "AI Everything Abu Dhabi",
    description:
      "Meet Niticore at AI Everything Abu Dhabi, 6–7 October 2026, ADNEC Centre, stands H3-P041 + H3-P042. Take the free readiness diagnostic or get a guided walkthrough of the platform.",
  },
  "/demo": {
    title: "Book a demo",
    description:
      "Book a live platform demo. Bring your AI systems and a certified AI governance specialist will show you where the gaps are.",
  },
  "/about": {
    title: "About",
    description:
      "Niticore helps organisations build the capability to govern AI, combining expert advisory, practical training and an intelligent governance platform.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How Niticore collects, uses and protects personal data when you visit this website or book a demo, and the rights and choices you have.",
  },
  "/terms": {
    title: "Terms & Conditions",
    description:
      "The terms for using the Niticore website: acceptable use, intellectual property, third-party links and the limits of our liability.",
  },
  "/cookies": {
    title: "Cookie Policy",
    description:
      "The cookies this website uses, why it uses them, and how to change your cookie settings at any time.",
  },
} as const;

/** Legal pages: listed in the sitemap at a lower priority, and under "Optional" in llms.txt. */
export const LEGAL_PAGES = ["/privacy", "/terms", "/cookies"] as const satisfies readonly PagePath[];

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
