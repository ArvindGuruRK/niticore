import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

/**
 * Email theme. Email clients can't read the site's CSS, so the design-system tokens from globals.css
 * are copied here as plain values and every style is inline. Keep them in step with globals.css.
 */
export const C = {
  canvas: "#06011f", // ink-950
  surface: "#0c062b", // ink-900
  raised: "#140d3d", // ink-800
  fg: "#f2f0fb",
  muted: "#cbc6e4",
  subtle: "#a6a1c4",
  accent: "#4ae057", // signal-400
  accentInk: "#06011f",
  tertiary: "#a98bff", // aura-400
  line: "rgba(255,255,255,0.10)",
} as const;

// Sora and Manrope load where the client allows web fonts (Apple Mail, iOS); elsewhere the fallbacks
export const DISPLAY = "Sora, 'Segoe UI', Helvetica, Arial, sans-serif";
export const BODY = "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif";

export const text = {
  h1: { margin: 0, fontFamily: DISPLAY, fontSize: "34px", lineHeight: "40px", fontWeight: 600, letterSpacing: "-0.03em", color: C.fg },
  h2: { margin: 0, fontFamily: DISPLAY, fontSize: "18px", lineHeight: "26px", fontWeight: 600, letterSpacing: "-0.015em", color: C.fg },
  lead: { margin: 0, fontFamily: BODY, fontSize: "17px", lineHeight: "28px", fontWeight: 500, color: C.muted },
  body: { margin: 0, fontFamily: BODY, fontSize: "15px", lineHeight: "24px", fontWeight: 500, color: C.muted },
  label: { margin: 0, fontFamily: BODY, fontSize: "13px", lineHeight: "20px", fontWeight: 700, color: C.subtle },
  small: { margin: 0, fontFamily: BODY, fontSize: "13px", lineHeight: "20px", fontWeight: 500, color: C.subtle },
} as const;

/** A panel: surface fill, hairline border, 20px corners (the site's panel radius). */
export const panel = {
  backgroundColor: C.surface,
  border: `1px solid ${C.line}`,
  borderRadius: "20px",
  padding: "40px 36px",
} as const;

/** A green pill button, the site's primary CTA. Links, so it works in every client. */
export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: C.accent,
        color: C.accentInk,
        fontFamily: BODY,
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "20px",
        textDecoration: "none",
        padding: "14px 26px",
        borderRadius: "999px",
      }}
    >
      {children}
    </Link>
  );
}

/** A small rounded tag, e.g. one framework. */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        margin: "0 6px 8px 0",
        padding: "6px 12px",
        borderRadius: "999px",
        backgroundColor: "rgba(169,139,255,0.14)",
        border: "1px solid rgba(169,139,255,0.35)",
        color: C.fg,
        fontFamily: BODY,
        fontSize: "13px",
        fontWeight: 700,
        lineHeight: "16px",
      }}
    >
      {children}
    </span>
  );
}

/**
 * The frame every Niticore email shares: dark canvas, logo, 600px column, footer. `siteUrl` is the
 * absolute site address (emails have no "current page"); pass "" only for in-browser previews.
 */
export function EmailShell({
  preview,
  siteUrl,
  footerNote,
  children,
}: {
  preview: string;
  siteUrl: string;
  footerNote: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Ask clients not to auto-invert the dark design */}
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- an email document, not a Next.js page */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700&family=Sora:wght@600&display=swap"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, padding: "32px 12px", backgroundColor: C.canvas, color: C.fg }}>
        <Container style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          <Section style={{ padding: "0 4px 24px" }}>
            <Link href={siteUrl || "/"}>
              <Img src={`${siteUrl}/email-logo.png`} width="156" height="38" alt="Niticore" style={{ display: "block" }} />
            </Link>
          </Section>

          {children}

          <Section style={{ padding: "28px 4px 0" }}>
            <Hr style={{ borderColor: C.line, margin: "0 0 20px" }} />
            <Text style={{ ...text.small, color: C.muted }}>Niticore · The operating layer for governed AI</Text>
            <Text style={{ ...text.small, margin: "4px 0 0" }}>Dubai · Bengaluru · London</Text>
            <Text style={{ ...text.small, margin: "16px 0 0" }}>{footerNote}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
