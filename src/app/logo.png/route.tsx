import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Built once at build time and served as a plain static PNG
export const dynamic = "force-static";

/**
 * A square 512 x 512 brand logo (the Niticore mark on the dark canvas) for structured data: Google
 * wants an organisation logo of at least 112 x 112 px in a raster format. The mark file wraps a PNG
 * inside an SVG, so the PNG is taken out and drawn directly.
 */
export async function GET() {
  const svg = await readFile(join(process.cwd(), "public/logo/niticore-mark.svg"), "utf8");
  const png = svg.match(/href="(data:image\/png;base64,[^"]+)"/)?.[1];
  if (!png) throw new Error("public/logo/niticore-mark.svg no longer embeds a PNG; update this route.");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#06011F",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG by ImageResponse */}
        <img src={png} width={320} height={320} alt="" />
      </div>
    ),
    { width: 512, height: 512 },
  );
}
