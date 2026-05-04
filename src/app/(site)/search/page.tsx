import { ArticleGrid } from "@/components/site/ArticleGrid";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getCategories, searchArticles } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [categories, articles] = await Promise.all([
    getCategories(),
    searchArticles(q),
  ]);

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <form action="/search" className="flex max-w-2xl gap-2">
          <input
            className="min-h-11 flex-1 rounded-md border border-zinc-300 px-4 text-sm outline-none focus:border-red-700"
            defaultValue={q}
            name="q"
            placeholder="Search news"
            type="search"
          />
          <button className="rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white">
            Search
          </button>
        </form>
        <div className="border-b border-zinc-200 pb-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-700">
            Results
          </p>
          <h1 className="mt-2 text-4xl font-black">
            {q ? `Search: ${q}` : "Search newsz9"}
          </h1>
        </div>
        {q && articles.length ? (
          <ArticleGrid articles={articles} />
        ) : (
          <p className="py-16 text-zinc-600">
            {q ? "No matching articles found." : "Enter a search term to begin."}
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
