import { categoryDisplayName } from "@/lib/language";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { getArticlesByCategory, getCategories } from "@/lib/data";
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug && c.language === "te");
  if (!category) return { title: "Category Not Found", robots: { index: false } };
  return { title: `${categoryDisplayName(category)} News | NEWSZ9`, description: `${categoryDisplayName(category)}: latest news and background in Telugu.`, alternates: { canonical: `/${slug}` } };
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug && c.language === "te");
  if (!category) notFound();
  const articles = await getArticlesByCategory(slug, "te");
  return <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
    <Breadcrumbs items={[{ label: categoryDisplayName(category) }]} /><h1 className="border-b-2 pb-4 text-4xl font-bold">{categoryDisplayName(category)}</h1>
    {articles.length ? <ArticleGrid articles={articles} /> : <p className="py-12">No articles are currently available in this category.</p>}
  </div>;
}
