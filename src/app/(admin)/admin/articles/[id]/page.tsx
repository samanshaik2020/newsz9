import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getAdminArticleById, getCategories } from "@/lib/data";
import { maybeCreateServiceClient } from "@/lib/supabase";
import type { Author } from "@/types";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = maybeCreateServiceClient();
  const [article, categories] = await Promise.all([
    getAdminArticleById(id),
    getCategories(),
  ]);

  if (!article) notFound();

  let authors: Author[] = [];
  let tags: { id: string; name: string; slug: string }[] = [];
  let articleTagIds: string[] = [];

  if (supabase) {
    const [authorsRes, tagsRes, articleTagsRes] = await Promise.all([
      supabase.from("authors").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
      supabase
        .from("article_tags")
        .select("tag_id")
        .eq("article_id", article.id),
    ]);
    authors = (authorsRes.data ?? []) as Author[];
    tags = (tagsRes.data ?? []) as { id: string; name: string; slug: string }[];
    articleTagIds = (articleTagsRes.data ?? []).map(
      (row: { tag_id: string }) => row.tag_id,
    );
  }

  return (
    <ArticleForm
      article={article}
      authors={authors}
      availableTags={tags}
      categories={categories}
      initialTagIds={articleTagIds}
      mode="edit"
    />
  );
}
