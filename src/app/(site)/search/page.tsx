import type { Metadata } from "next";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { searchArticles } from "@/lib/data";
export const metadata: Metadata = { title: "Search News | NEWSZ9", robots: { index: false, follow: true } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const articles = await searchArticles(q);
  return <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
    <form action="/search" className="flex max-w-2xl gap-2">
      <input className="min-h-12 min-w-0 flex-1 rounded border p-3" defaultValue={q} name="q" aria-label="Search News" placeholder="Search News" type="search" maxLength={100} />
      <button className="rounded bg-red-700 px-5 text-white">Search</button>
    </form>
    <h1 className="border-b pb-4 text-3xl font-bold">{q ? `Search results for: ${q}` : "Search News"}</h1>
    {articles.length ? <ArticleGrid articles={articles} /> : <p className="py-12">{q ? "No articles found for your search." : "Search for news using a Telugu keyword."}</p>}
  </div>;
}
