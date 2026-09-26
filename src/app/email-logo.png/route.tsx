import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Built once at build time and served as a plain static PNG
export const dynamic = "force-static";

/**
 * The Niticore wordmark as a PNG, for emails: Gmail and several other clients don't render SVG.
 * Drawn at 2x (312 x 76) on a transparent background, so it stays crisp on high-density screens when
 * the email shows it at 156 x 38.
 */
export async function GET() {
  const svg = await readFile(join(process.cwd(), "public/logo/niticore.svg"), "utf8");
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG by ImageResponse */}
        <img src={src} width={312} height={76} alt="" />
      </div>
    ),
    { width: 312, height: 76 },
  );
}
