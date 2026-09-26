import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import { AnnouncementBar } from "@/components/announcement-bar";
import { BackToTop } from "@/components/motion/back-to-top";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { JsonLd, SITE_GRAPH } from "@/components/seo/json-ld";
import { PAGES, SITE_URL } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

// Terminal text only (LogStream), so it is not preloaded on every page
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <noscript>
          <style>{"[data-anim],[data-anim-stagger]>*,[data-word]{opacity:1!important}[data-split]{visibility:visible!important}[data-clip]{clip-path:none!important}[data-draw]{visibility:visible!important}"}</style>
        </noscript>
        <JsonLd data={SITE_GRAPH} />
        <AnnouncementBar />
        <SmoothScroll />
        <BackToTop />
        {children}
      </body>
    </html>
  );
}
