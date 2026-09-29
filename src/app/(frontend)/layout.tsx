import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { JsonLd, SITE_GRAPH } from "@/components/seo/json-ld";
import { SiteChrome } from "@/components/site-chrome";
import { PAGES, SITE_URL } from "@/lib/site";
import { FONT_VARIABLES } from "../fonts";
import "../globals.css";

/**
 * Root layout of the public site. The CMS admin (app/(payload)) has its own root layout, so the
 * site's styles, fonts and scripts never load there, and the admin's never load here.
 */

// viewport-fit=cover lets the canvas run under notches; globals.css --safe-* tokens keep content clear of them.
// No maximumScale: pinch zoom stays available for accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06011F",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  // Absolute base for the generated Open Graph image: NEXT_PUBLIC_SITE_URL, else the Vercel address
  metadataBase: new URL(SITE_URL),
  // Inner pages set a bare title ("Platform") and the template adds the brand
  title: {
    default: PAGES["/"].title,
    template: "%s | Niticore",
  },
  description: PAGES["/"].description,
  // The home page's canonical address; inner pages set their own through pageMetadata()
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    type: "website",
    siteName: "Niticore",
    title: PAGES["/"].title,
    description: PAGES["/"].description,
  },
  twitter: { card: "summary_large_image" },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${FONT_VARIABLES} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <JsonLd data={SITE_GRAPH} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
