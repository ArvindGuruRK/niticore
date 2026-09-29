import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

/**
 * Security headers on every response. Chosen so nothing the site does can break:
 * - The CSP sets only the directives that don't touch scripts or styles (Next.js, GSAP and the
 *   fonts need inline scripts and styles, which a script-src policy would require nonces for):
 *   no framing by other sites, no <object>/<embed>, no <base> hijacking, forms only post here.
 * - HSTS without `preload`, so a future custom domain can opt in deliberately.
 * The design-system email previews use srcdoc frames, which these headers don't affect.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Don't advertise the framework in an X-Powered-By header
  poweredByHeader: false,
  // Never publish source maps for the browser bundles (this is Next's default; kept explicit so it
  // can't be switched on by accident)
  productionBrowserSourceMaps: false,
  images: {
    // Stock photos are fetched once by the image optimiser, then resized per screen and served from
    // this site's own domain, so visitors' browsers never call Unsplash directly
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" },
      // Blog and news images uploaded through the CMS, stored in Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Two Server Actions: Book a demo (a few short fields, notes capped at 2,000 characters) and
      // the CMS admin's server functions, which send a whole article's form state on each save; a
      // long post runs to hundreds of KB. 4 MB covers that and sits under Vercel's 4.5 MB request
      // cap. Image uploads don't pass through here (they go to Blob directly).
      bodySizeLimit: "4mb",
    },
    // The site and the CMS admin have separate root layouts, so unmatched addresses get their 404
    // from app/global-not-found.tsx
    globalNotFound: true,
  },
  // The event page moved from /ai-everything to /announcements; keep shared links working
  async redirects() {
    return [
      { source: "/ai-everything", destination: "/announcements", permanent: true },
      { source: "/ai-everything/:path*", destination: "/announcements/:path*", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Payload CMS (the /admin panel and its /api routes) runs inside this app
export default withPayload(nextConfig, { devBundleServerPackages: false });
