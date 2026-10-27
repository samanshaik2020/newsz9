import type { MetadataRoute } from "next";
import { getAllPublicArticles, getCategories } from "@/lib/data";
import { SITE_URL, trustLinks, POLICY_DATE } from "@/lib/site-config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([getCategories(), getAllPublicArticles()]);
  const authors = [...new Set(articles.filter((a) => a.authors?.role !== "bot" && /[\u0C00-\u0C7F]/.test(a.authors?.name ?? "")).map((a) => a.author_id).filter(Boolean))];
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/latest` },
    ...trustLinks.map((link) => ({ url: SITE_URL + link.href, lastModified: new Date(POLICY_DATE) })),
    ...categories.filter((c) => c.language === "te").map((c) => ({ url: `${SITE_URL}/${encodeURIComponent(c.slug)}` })),
    ...authors.map((id) => ({ url: `${SITE_URL}/author/${id}` })),
    ...articles.filter((a) => !/health|ఆరోగ్య|వైద్య/i.test(`${a.categories?.slug} ${a.categories?.name}`) || (a.editorial_reviewed && a.reviewer_id && a.sources?.length)).map((a) => ({ url: `${SITE_URL}/article/${encodeURIComponent(a.slug)}`, lastModified: new Date(a.updated_at && Date.parse(a.updated_at) <= Date.now() ? a.updated_at : a.published_at!) })),
  ];
}
