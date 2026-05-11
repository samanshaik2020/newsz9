import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  
  const articles = await getPublishedArticles(limit, offset);
  return NextResponse.json({ articles });
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/admin/articles for admin article writes." },
    { status: 405 },
  );
}
