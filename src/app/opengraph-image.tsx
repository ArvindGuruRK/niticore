import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Niticore: the operating layer for governed AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Sora 600 from Google Fonts, so the card matches the site. Falls back to the default font if offline. */
async function loadSora() {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Sora:wght@600")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return undefined;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return undefined;
  }
}

export default async function Image() {
  const [logo, sora] = await Promise.all([
    readFile(join(process.cwd(), "public/logo/niticore.svg"), "utf8"),
    loadSora(),
  ]);
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#06011F",
          backgroundImage:
            "radial-gradient(ellipse 60% 70% at 85% 10%, rgba(169,139,255,0.22), transparent 70%), radial-gradient(ellipse 50% 60% at 0% 100%, rgba(74,224,87,0.14), transparent 70%)",
          fontFamily: sora ? "Sora" : "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={234} height={57} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#F2F0FB",
            }}
          >
            <span>Move fast with AI.</span>
            <span style={{ display: "flex" }}>
              Govern it with&nbsp;<span style={{ color: "#4AE057" }}>confidence.</span>
            </span>
          </div>
          <div style={{ fontSize: 30, color: "#CBC6E4", display: "flex" }}>
            The operating layer for governed AI
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: sora ? [{ name: "Sora", data: sora, weight: 600, style: "normal" }] : undefined,
    },
  );
}
