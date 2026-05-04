import { NextResponse } from "next/server";
import { getCategories, getPublishedArticles } from "@/lib/data";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";
  const [categories, articles] = await Promise.all([
    getCategories(),
    getPublishedArticles(1000),
  ]);
  const urls = [
    siteUrl,
    ...categories.map((category) => `${siteUrl}/${category.slug}`),
    ...articles.map((article) => `${siteUrl}/article/${article.slug}`),
  ];

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((url) => `  <url><loc>${url}</loc></url>`)
      .join("\n")}\n</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    },
  );
}
