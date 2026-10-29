import { NextResponse } from "next/server";
// Google's Indexing API is restricted to JobPosting and livestream video pages.
export async function POST() {
  return NextResponse.json({ error: "This service does not apply to news articles. Use the sitemap to notify search engines." }, { status: 410 });
}
