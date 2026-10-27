import type { Metadata } from "next";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { searchArticles } from "@/lib/data";
export const metadata: Metadata = { title: "వార్తలు వెతకండి | న్యూస్‌జెడ్‌9", robots: { index: false, follow: true } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const articles = await searchArticles(q);
  return <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
    <form action="/search" className="flex max-w-2xl gap-2">
      <input className="min-h-12 min-w-0 flex-1 rounded border p-3" defaultValue={q} name="q" aria-label="వార్తలు వెతకండి" placeholder="వార్తలు వెతకండి" type="search" maxLength={100} />
      <button className="rounded bg-red-700 px-5 text-white">వెతకండి</button>
    </form>
    <h1 className="border-b pb-4 text-3xl font-bold">{q ? `వెతికిన అంశం: ${q}` : "వార్తలు వెతకండి"}</h1>
    {articles.length ? <ArticleGrid articles={articles} /> : <p className="py-12">{q ? "మీరు వెతికిన అంశానికి కథనాలు కనిపించలేదు." : "తెలుగు పదంతో మీకు కావాల్సిన వార్తను వెతకండి."}</p>}
  </div>;
}
