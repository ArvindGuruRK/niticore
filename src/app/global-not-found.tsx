import type { Metadata, Viewport } from "next";
import { NotFoundView } from "@/components/not-found-view";
import { SiteChrome } from "@/components/site-chrome";
import { FONT_VARIABLES } from "./fonts";
import "./globals.css";

/**
 * An address that matches no route. The site and the CMS admin have separate root layouts, so Next
 * skips both here and renders this whole document (enabled by experimental.globalNotFound in
 * next.config.ts). Same fonts, chrome and page as the site's own 404.
 */
export const metadata: Metadata = {
  title: "Page not found | Niticore",
  robots: { index: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06011F",
  colorScheme: "dark",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${FONT_VARIABLES} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteChrome>
          <NotFoundView />
        </SiteChrome>
      </body>
    </html>
  );
}
