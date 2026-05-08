import type { Metadata } from "next";
import { ArticleGrid } from "@/components/site/ArticleGrid";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getArticlesByCategory, getCategories } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://newsz9.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === categorySlug);
  const name = category?.name ?? "News";
  const categoryUrl = `${siteUrl}/${categorySlug}`;

  return {
    title: `${name} News | newsz9`,
    description: `Latest ${name} news and updates on newsz9 — fast bilingual coverage for English and Telugu readers.`,
    openGraph: {
      title: `${name} News | THE NEWSZ9`,
      description: `Latest ${name} news and updates on newsz9.`,
      url: categoryUrl,
      siteName: "THE NEWSZ9",
      type: "website",
      locale: category?.language === "te" ? "te_IN" : "en_IN",
    },
    twitter: {
      card: "summary",
      title: `${name} News | THE NEWSZ9`,
      description: `Latest ${name} news and updates on newsz9.`,
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

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
        <Breadcrumbs
          items={[{ label: category?.name ?? "News" }]}
        />
        <div className="border-b-2 border-zinc-950 pb-4">
          <p className="text-sm font-black uppercase text-red-600">
            Category
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight">
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
