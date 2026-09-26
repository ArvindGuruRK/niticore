import { PAGES, SITE_URL } from "@/lib/site";

/**
 * Renders schema.org structured data as a JSON-LD script. `<` is escaped (per the Next.js JSON-LD
 * guide) so no string in the data can close the script tag and inject markup.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}

/** Who Niticore is and what the site is: on every page, from the root layout. */
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Niticore",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      slogan: "The operating layer for governed AI",
      description: PAGES["/"].description,
      knowsAbout: [
        "AI governance",
        "EU AI Act",
        "ISO/IEC 42001",
        "NIST AI Risk Management Framework",
        "GDPR",
        "DIFC Regulation 10",
        "UAE PDPL",
        "ADGM Data Protection Regulations",
        "Agentic AI governance",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Niticore",
      url: SITE_URL,
      description: PAGES["/"].description,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
