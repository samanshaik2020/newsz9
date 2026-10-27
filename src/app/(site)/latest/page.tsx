import type { Metadata } from "next";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { getPublishedArticles } from "@/lib/data";
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = Math.max(1, Math.min(10000, parseInt((await searchParams).page ?? "1") || 1));
  return { title: "తాజా వార్తలు | న్యూస్‌జెడ్‌9", alternates: { canonical: page === 1 ? "/latest" : `/latest?page=${page}` } };
}
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Math.min(10000, parseInt((await searchParams).page ?? "1") || 1));
  const articles = await getPublishedArticles(21, (page - 1) * 20);
  return <div className="mx-auto max-w-7xl px-4 py-8"><h1 className="mb-8 text-4xl font-bold">తాజా వార్తలు</h1>{articles.length ? <ArticleGrid articles={articles.slice(0, 20)} /> : <p>ప్రస్తుతం కథనాలు అందుబాటులో లేవు.</p>}<nav aria-label="వార్తల పేజీలు" className="mt-8 flex gap-6 text-red-700">{page > 1 && <a href={`/latest?page=${page - 1}`}>← ముందు పేజీ</a>}{articles.length > 20 && <a href={`/latest?page=${page + 1}`}>తరువాతి పేజీ →</a>}</nav></div>;
}
