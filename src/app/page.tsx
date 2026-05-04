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
  const tickerItems = breakingNews.length
    ? breakingNews
    : articles.slice(0, 5).map((article) => ({
        created_at: article.created_at,
        headline: article.title,
        id: `article-ticker-${article.id}`,
        is_active: true,
        url: `/article/${article.slug}`,
      }));

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <BreakingTicker items={tickerItems} />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 pb-10">
        {leadArticle ? <HeroSection article={leadArticle} /> : null}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-8">
            <section className="grid gap-1 border-t-2 border-zinc-950 pt-1">
              <div className="flex items-end justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2">
                <h2 className="text-xl font-black">Latest News</h2>
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
