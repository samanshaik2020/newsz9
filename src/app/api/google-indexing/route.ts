import { NextResponse } from "next/server";

/**
 * Google Indexing API integration.
 * Call this endpoint after publishing an article to request Google
 * to crawl and index it immediately.
 *
 * POST /api/google-indexing
 * Body: { url: string, type?: "URL_UPDATED" | "URL_DELETED" }
 *
 * Requires GOOGLE_INDEXING_API_KEY in .env.local
 */
export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_INDEXING_API_KEY;

  if (!apiKey || apiKey === "your_google_api_key") {
    return NextResponse.json(
      { error: "GOOGLE_INDEXING_API_KEY is not configured in .env.local." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    url?: string;
    type?: "URL_UPDATED" | "URL_DELETED";
  };

  if (!body.url) {
    return NextResponse.json(
      { error: "url is required in request body." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications:publish?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: body.url,
          type: body.type ?? "URL_UPDATED",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Google Indexing API error", details: data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to call Google Indexing API." },
      { status: 500 },
    );
  }
}
