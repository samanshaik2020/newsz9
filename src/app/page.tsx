import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { CategorySection } from "@/components/site/CategorySection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSplit } from "@/components/site/HeroSplit";
import { HomeRefresh } from "@/components/site/HomeRefresh";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { RightSidebar } from "@/components/site/RightSidebar";
import { getBreakingNews, getCategories, getPublishedArticles } from "@/lib/data";
import { composeHomepage, normalizedText } from "@/lib/editorial";

export const metadata: Metadata = { title: "NEWSZ9 | Latest Telugu News", alternates: { canonical: "/" } };
export default async function Home({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  if ((await searchParams).lang) redirect("/");
  const [categories, breaking, articles] = await Promise.all([getCategories(), getBreakingNews(), getPublishedArticles(100)]);
  const teluguCategories = categories.filter((c) => c.language === "te");
  const { lead, top, latest, sections, trending } = composeHomepage(articles, teluguCategories);
  const used = [lead, ...top, ...latest, ...sections.flatMap((s) => s.articles), ...trending].filter(Boolean);
  const tickerItems = breaking.filter((b) => !used.some((a) => a && (b.url === `/article/${a.slug}` || normalizedText(b.headline) === normalizedText(a.title)))).map((b) => {
    // Old hand-entered root story URLs no longer resolve to article pages.
    const validPath = b.url === "/" || b.url === "/latest" || b.url?.startsWith("/article/") || teluguCategories.some((c) => b.url === `/${c.slug}`);
    return b.url?.startsWith("/") && !validPath ? { ...b, url: null } : b;
  });
  return <div className="flex min-h-screen flex-col bg-white text-zinc-950">
    <HomeRefresh />
    <Header categories={teluguCategories} /><BreakingTicker items={tickerItems} />
    <main id="main-content" className="flex-1">
      <div className={`mx-auto grid max-w-7xl gap-7 px-4 py-6 ${trending.length ? "lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]" : ""}`}>
        <div className="grid min-w-0 gap-8">
          {lead ? <HeroSplit featured={lead} sideArticles={top} /> : <section className="rounded border bg-zinc-50 p-8 telugu-copy"><h1 className="text-3xl font-bold">Latest Telugu News</h1><p className="mt-4">No articles are available right now. Please check back later.</p><Link className="mt-4 inline-block text-red-700 underline" href="/about-us">Learn About Our Publication</Link></section>}
          {latest.length > 0 && <section><div className="section-heading"><h2 className="section-heading__title">Latest News</h2><Link className="section-heading__link" href="/latest">More News →</Link></div><ArticleGrid articles={latest} /></section>}
          {sections.map((s) => <CategorySection key={s.category.id} articles={s.articles} category={s.category} />)}
          <section className="rounded-lg border-l-4 border-red-700 bg-zinc-50 p-6 telugu-copy"><h2 className="text-2xl font-bold">Explore the Evidence Behind the News</h2><p className="mt-2">Read our reporting standards, sources, and corrections policy. Share important news from your area with supporting evidence.</p><div className="mt-4 flex flex-wrap gap-5 text-red-700 underline"><Link href="/editorial-policy">Our Editorial Standards</Link><Link href="/contact-us">Send a News Tip</Link></div></section>
        </div>
        {trending.length > 0 && <RightSidebar articles={trending} />}
      </div>
    </main><Footer categories={teluguCategories} />
  </div>;
}
