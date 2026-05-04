import type { MetadataRoute } from "next";
import { getCategories, getPublishedArticles } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";
  const [categories, articles] = await Promise.all([
    getCategories(),
    getPublishedArticles(1000),
  ]);

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
    ...categories.map((category) => ({
      url: `${siteUrl}/${category.slug}`,
      lastModified: new Date(),
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/article/${article.slug}`,
      lastModified: new Date(article.updated_at ?? article.created_at),
    })),
  ];
}
