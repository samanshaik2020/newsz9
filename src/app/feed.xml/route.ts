import { getPublishedArticles } from "@/lib/data";
import { stripHtml } from "@/lib/utils";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";
  const articles = await getPublishedArticles(50);

  const items = articles
    .map((article) => {
      const pubDate = article.published_at
        ? new Date(article.published_at).toUTCString()
        : new Date(article.created_at).toUTCString();

      const description = article.summary
        ? escapeXml(stripHtml(article.summary))
        : escapeXml(stripHtml(article.content).slice(0, 200));

      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${siteUrl}/article/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/article/${article.slug}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${article.categories?.name ? `<category>${escapeXml(article.categories.name)}</category>` : ""}
      ${article.cover_image ? `<enclosure url="${escapeXml(article.cover_image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>THE NEWSZ9</title>
    <link>${siteUrl}</link>
    <description>Fast bilingual news for English and Telugu readers across national, regional, business, sports, and technology coverage.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
