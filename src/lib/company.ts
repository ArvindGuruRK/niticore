/**
 * Company facts for the legal pages, the footer and structured data, in one place.
 *
 * Values come from docs/ or from the client. The fields set to `null` are still to be confirmed by
 * the client: while they are null the site leaves them out (it never shows a stand-in), and the
 * LocalBusiness structured data is only published once `address` is filled in.
 */

type Address = {
  /** Street address, including office or building */
  street: string;
  /** City, e.g. "Dubai" */
  locality: string;
  /** Emirate, state or county, if used */
  region?: string;
  postalCode?: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "AE" (for structured data) */
  country: string;
  /** The country as written on the site, e.g. "United Arab Emirates" */
  countryName: string;
};

type Company = {
  /** The brand, as written in site copy */
  name: string;
  /** Registered legal entity, e.g. "Niticore AI FZ-LLC". To be confirmed. */
  legalName: string | null;
  /** Registered office. To be confirmed. */
  address: Address | null;
  /** Main phone line in E.164, e.g. "+971…". To be confirmed. */
  phone: string | null;
  /** Law and courts that govern the Terms, e.g. { law: "the laws of the Dubai International
   *  Financial Centre", courts: "the DIFC Courts" }. To be confirmed. */
  governingLaw: { law: string; courts: string } | null;
  /** For privacy, legal and general questions (docs: the Niticore website concept) */
  email: string;
  /** The footers of the HTML prototypes in docs/ */
  hubs: readonly string[];
  /** The footers of the HTML prototypes in docs/ */
  certification: string;
  socials: readonly { label: string; href: string }[];
};

export const COMPANY: Company = {
  name: "Niticore",
  legalName: null,
  address: null,
  phone: null,
  governingLaw: null,
  email: "hello@niticore.ai",
  hubs: ["Dubai", "Bengaluru", "London"],
  certification: "ISO/IEC 42001:2023 Certified",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/niticore-ai/" },
    { label: "Instagram", href: "https://www.instagram.com/niticore_ai/" },
  ],
};

/** How the legal pages name the company: the registered entity once known, else the brand. */
export const LEGAL_NAME = COMPANY.legalName ?? COMPANY.name;

/**
 * When the Privacy Policy, Terms and Cookie Policy were last changed (ISO date). Update it with any
 * change to their wording, so the "Last updated" line stays true.
 */
export const LEGAL_UPDATED = "2026-09-28";

/** "28 September 2026" */
export const formatLegalDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** "Street, City, Region, Postcode, Country" on one line, or null while the address is unknown. */
export const formatAddress = (address: Address | null) =>
  address
    ? [address.street, address.locality, address.region, address.postalCode, address.countryName].filter(Boolean).join(", ")
    : null;
