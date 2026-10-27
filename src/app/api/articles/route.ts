import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/data";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const offset = Number(params.get("offset") ?? 0), limit = Number(params.get("limit") ?? 12);
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50) return NextResponse.json({ error: "పేజీ వివరాలు సరిచూడండి." }, { status: 400 });
  return NextResponse.json({ articles: await getPublishedArticles(limit, offset, "te") });
}
export async function POST() { return NextResponse.json({ error: "నిర్వాహకుల కథన సేవను ఉపయోగించండి." }, { status: 405 }); }
