import { ArticleGrid } from "@/components/site/ArticleGrid";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getArticlesByCategory, getCategories } from "@/lib/data";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticlesByCategory(categorySlug),
  ]);
  const category = categories.find((item) => item.slug === categorySlug);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <div className="border-b border-zinc-200 pb-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-700">
            Category
          </p>
          <h1 className="mt-2 text-4xl font-black">
            {category?.name ?? "News"}
          </h1>
        </div>
        {articles.length ? (
          <ArticleGrid articles={articles} />
        ) : (
          <p className="py-16 text-zinc-600">No published articles yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
