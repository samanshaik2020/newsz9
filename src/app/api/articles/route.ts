import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/data";
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0), limit = Number(params.get("limit") ?? 12);
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50) return NextResponse.json({ error: "Check the pagination parameters." }, { status: 400 });
  try {
    return NextResponse.json({ articles: await getPublishedArticles(limit, offset, "te") }, { headers });
  } catch {
    return NextResponse.json({ error: "Latest articles are temporarily unavailable. Please try again." }, { status: 503, headers });
  }
}
export async function POST() { return NextResponse.json({ error: "Use the admin articles API." }, { status: 405 }); }
