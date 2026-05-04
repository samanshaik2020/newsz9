import { notFound } from "next/navigation";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { getArticleBySlug, getCategories } from "@/lib/data";
import { maybeCreateClient } from "@/lib/supabase";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, categories] = await Promise.all([
    getArticleBySlug(slug),
    getCategories(),
  ]);

  if (!article) notFound();

  const supabase = maybeCreateClient();
  if (supabase) {
    await supabase.rpc("increment_views", { article_id: article.id });
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header categories={categories} />
      <TemplateRenderer article={article} />
      <Footer />
    </div>
  );
}
