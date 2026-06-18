import { AdBanner } from "@/components/site/AdBanner";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { CategorySection } from "@/components/site/CategorySection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSplit } from "@/components/site/HeroSplit";
import { InfiniteArticleGrid } from "@/components/site/InfiniteArticleGrid";
import { RightSidebar } from "@/components/site/RightSidebar";
import {
  getBreakingNews,
  getCategories,
  getPublishedArticles,
  getTrendingArticles,
} from "@/lib/data";
import Link from "next/link";

export default async function Home() {
  const [categories, breakingNews, articles, trending] = await Promise.all([
    getCategories(),
    getBreakingNews(),
    getPublishedArticles(36),
    getTrendingArticles(10),
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
  const heroSideArticles = latestArticles.slice(0, 5);
  const initialLatestArticles = latestArticles.slice(5, 14);
  const latestNextOffset = 1 + heroSideArticles.length + initialLatestArticles.length;
  const displayedCategories = categories
    .filter((category) =>
      articles.some((article) => article.categories?.slug === category.slug),
    )
    .slice(0, 8);

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-950">
      <Header categories={categories} />
      <BreakingTicker items={tickerItems} />
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-6 lg:grid-cols-[minmax(0,7fr)_minmax(300px,3fr)]">
          <div className="grid min-w-0 gap-8">
            {leadArticle ? (
              <HeroSplit featured={leadArticle} sideArticles={heroSideArticles} />
            ) : null}

            <AdBanner size="leaderboard" />

            <section>
              <div className="section-heading">
                <h2 className="section-heading__title">Latest News</h2>
                <Link className="section-heading__link" href="/search?q=Latest%20News">
                  View More &gt;
                </Link>
              </div>
              <InfiniteArticleGrid
                initialArticles={initialLatestArticles}
                nextOffset={latestNextOffset}
              />
            </section>

            <AdBanner size="billboard" />

            {displayedCategories.map((category, index) => (
              <div className="grid gap-8" key={category.id}>
                <CategorySection articles={articles} category={category} />
                {index % 2 === 1 ? <AdBanner size="leaderboard" /> : null}
              </div>
            ))}
          </div>

          <RightSidebar articles={trending} />
        </div>
      </main>
      <Footer categories={categories} />
    </div>
  );
}
