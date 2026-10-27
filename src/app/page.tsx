import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BreakingTicker } from "@/components/site/BreakingTicker";
import { CategorySection } from "@/components/site/CategorySection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { HeroSplit } from "@/components/site/HeroSplit";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { RightSidebar } from "@/components/site/RightSidebar";
import { getBreakingNews, getCategories, getPublishedArticles } from "@/lib/data";
import { composeHomepage, normalizedText } from "@/lib/editorial";

export const metadata: Metadata = { title: "న్యూస్‌జెడ్‌9 | తాజా తెలుగు వార్తలు", alternates: { canonical: "/" } };
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
    <Header categories={teluguCategories} /><BreakingTicker items={tickerItems} />
    <main id="main-content" className="flex-1">
      <div className={`mx-auto grid max-w-7xl gap-7 px-4 py-6 ${trending.length ? "lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]" : ""}`}>
        <div className="grid min-w-0 gap-8">
          {lead ? <HeroSplit featured={lead} sideArticles={top} /> : <section className="rounded border bg-zinc-50 p-8 telugu-copy"><h1 className="text-3xl font-bold">తాజా తెలుగు వార్తలు</h1><p className="mt-4">ప్రస్తుతం కథనాలు అందుబాటులో లేవు. కొద్దిసేపటి తరువాత మళ్లీ చూడండి.</p><Link className="mt-4 inline-block text-red-700 underline" href="/about-us">మా ప్రచురణ గురించి తెలుసుకోండి</Link></section>}
          {latest.length > 0 && <section><div className="section-heading"><h2 className="section-heading__title">తాజా వార్తలు</h2><Link className="section-heading__link" href="/latest">మరిన్ని వార్తలు →</Link></div><ArticleGrid articles={latest} /></section>}
          {sections.map((s) => <CategorySection key={s.category.id} articles={s.articles} category={s.category} />)}
          <section className="rounded-lg border-l-4 border-red-700 bg-zinc-50 p-6 telugu-copy"><h2 className="text-2xl font-bold">వార్త వెనుక ఆధారం తెలుసుకోండి</h2><p className="mt-2">మా వార్తా ప్రమాణాలు, మూలాలు, సవరణల విధానాన్ని చదవండి. మీ ప్రాంతంలో ముఖ్యమైన విషయం ఉంటే ఆధారాలతో తెలియజేయండి.</p><div className="mt-4 flex flex-wrap gap-5 text-red-700 underline"><Link href="/editorial-policy">మా సంపాదకీయ ప్రమాణాలు</Link><Link href="/contact-us">వార్తా సూచన పంపండి</Link></div></section>
        </div>
        {trending.length > 0 && <RightSidebar articles={trending} />}
      </div>
    </main><Footer categories={teluguCategories} />
  </div>;
}
