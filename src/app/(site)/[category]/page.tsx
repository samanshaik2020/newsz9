import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { getArticlesByCategory, getCategories } from "@/lib/data";
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug && c.language === "te");
  if (!category) return { title: "విభాగం కనిపించలేదు", robots: { index: false } };
  return { title: `${category.name} వార్తలు | న్యూస్‌జెడ్‌9`, description: `${category.name}కు సంబంధించిన తాజా వార్తలు, నేపథ్య వివరాలు తెలుగులో.`, alternates: { canonical: `/${slug}` } };
}
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug && c.language === "te");
  if (!category) notFound();
  const articles = await getArticlesByCategory(slug, "te");
  return <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
    <Breadcrumbs items={[{ label: category.name }]} /><h1 className="border-b-2 pb-4 text-4xl font-bold">{category.name}</h1>
    {articles.length ? <ArticleGrid articles={articles} /> : <p className="py-12">ఈ విభాగంలో ప్రస్తుతం కథనాలు అందుబాటులో లేవు.</p>}
  </div>;
}
