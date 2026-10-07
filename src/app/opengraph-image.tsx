import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NEWSZ9_WORDMARK } from "@/lib/branding";

export const alt = "NEWSZ9 — English & Telugu News";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public", NEWSZ9_WORDMARK.src),
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
          background: "#f5f5f5",
          borderBottom: "20px solid #e0001a",
        }}
      >
        {/* The original logo is embedded so this preview needs no external fetch. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="NEWSZ9"
          src={`data:image/jpeg;base64,${logo.toString("base64")}`}
          width={NEWSZ9_WORDMARK.width}
          height={NEWSZ9_WORDMARK.height}
        />
        <div style={{ display: "flex", color: "#18181b", fontSize: 38 }}>
          English &amp; Telugu News
        </div>
      </div>
    ),
    size,
  );
}
