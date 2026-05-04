import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/data";

export async function GET() {
  const articles = await getPublishedArticles(50);
  return NextResponse.json({ articles });
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/admin/articles for admin article writes." },
    { status: 405 },
  );
}
