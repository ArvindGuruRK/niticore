import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { BackToTop } from "@/components/motion/back-to-top";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
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
  title: "NitiCore | The operating layer for governed AI",
  description:
    "Continuous AI visibility, reusable compliance evidence, and agent guardrails, from first idea to production.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{"[data-anim],[data-anim-stagger]>*,[data-word]{opacity:1!important}[data-split]{visibility:visible!important}[data-clip]{clip-path:none!important}[data-draw]{visibility:visible!important}"}</style>
        </noscript>
        <SmoothScroll />
        <BackToTop />
        {children}
      </body>
    </html>
  );
}
