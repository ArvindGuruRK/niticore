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
  experimental: {
    serverActions: {
      // The only Server Action is Book a demo: a few short fields and notes capped at 2,000
      // characters. 64 KB is ample and stops oversized payloads before they are parsed.
      bodySizeLimit: "64kb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
