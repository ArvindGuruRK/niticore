import { COMPANY } from "@/lib/company";
import { PAGES, SITE_URL } from "@/lib/site";

/**
 * Renders schema.org structured data as a JSON-LD script. `<` becomes the six characters
 * \u003c (per the Next.js JSON-LD guide), which JSON reads back as `<`, so no string in the data
 * can close the script tag and inject markup. The replacement needs the doubled backslash: a single
 * one is just `<` again in JavaScript, which escapes nothing.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const ORG_ID = `${SITE_URL}/#organization`;
const LOGO = { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 };

/** Countries of the hubs in COMPANY.hubs (docs/content/08 §12), as ISO codes */
const HUB_COUNTRY: Record<string, string> = { Dubai: "AE", Bengaluru: "IN", London: "GB" };

const postalAddress = (a: NonNullable<typeof COMPANY.address>) => ({
  "@type": "PostalAddress",
  streetAddress: a.street,
  addressLocality: a.locality,
  ...(a.region && { addressRegion: a.region }),
  ...(a.postalCode && { postalCode: a.postalCode }),
  addressCountry: a.country,
});

/**
 * The registered office as a LocalBusiness (ProfessionalService), linked to the Organization. Only
 * published once COMPANY.address is filled in: search engines need a real street address for it.
 */
const LOCAL_BUSINESS = COMPANY.address && {
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#localbusiness`,
  name: COMPANY.name,
  ...(COMPANY.legalName && { legalName: COMPANY.legalName }),
  url: SITE_URL,
  image: LOGO,
  logo: LOGO,
  description: PAGES["/"].description,
  email: COMPANY.email,
  ...(COMPANY.phone && { telephone: COMPANY.phone }),
  address: postalAddress(COMPANY.address),
  parentOrganization: { "@id": ORG_ID },
};

/** Who Niticore is and what the site is: on every page, from the root layout. */
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: COMPANY.name,
      ...(COMPANY.legalName && { legalName: COMPANY.legalName }),
      url: SITE_URL,
      logo: LOGO,
      email: COMPANY.email,
      ...(COMPANY.phone && { telephone: COMPANY.phone }),
      ...(COMPANY.address && { address: postalAddress(COMPANY.address) }),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: COMPANY.email,
        url: `${SITE_URL}/demo`,
        availableLanguage: "en",
      },
      location: COMPANY.hubs.map((city) => ({
        "@type": "Place",
        name: city,
        address: {
          "@type": "PostalAddress",
          addressLocality: city,
          ...(HUB_COUNTRY[city] && { addressCountry: HUB_COUNTRY[city] }),
        },
      })),
      sameAs: COMPANY.socials.map((s) => s.href),
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
      publisher: { "@id": ORG_ID },
    },
    ...(LOCAL_BUSINESS ? [LOCAL_BUSINESS] : []),
  ],
};
