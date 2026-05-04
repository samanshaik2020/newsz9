import { ArticleGrid } from "@/components/site/ArticleGrid";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { CategoryRow } from "@/components/site/CategoryRow";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSection } from "@/components/site/HeroSection";
import { Sidebar } from "@/components/site/Sidebar";
import {
  getBreakingNews,
  getCategories,
  getPublishedArticles,
  getTrendingArticles,
} from "@/lib/data";

export default async function Home() {
  const [categories, breakingNews, articles, trending] = await Promise.all([
    getCategories(),
    getBreakingNews(),
    getPublishedArticles(12),
    getTrendingArticles(5),
  ]);
  const [leadArticle, ...latestArticles] = articles;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <BreakingTicker items={breakingNews} />
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-8">
        {leadArticle ? <HeroSection article={leadArticle} /> : null}
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-10">
            <section className="grid gap-4">
              <div className="flex items-end justify-between border-b border-zinc-200 pb-2">
                <h2 className="text-2xl font-black">Latest News</h2>
              </div>
              <ArticleGrid articles={latestArticles.slice(0, 6)} />
            </section>
            {categories.slice(0, 6).map((category) => (
              <CategoryRow
                articles={articles}
                category={category}
                key={category.id}
              />
            ))}
          </div>
          <Sidebar articles={trending} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
