import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getAdminArticleById, getCategories } from "@/lib/data";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    getAdminArticleById(id),
    getCategories(),
  ]);

  if (!article) notFound();

  return <ArticleForm article={article} categories={categories} mode="edit" />;
}
