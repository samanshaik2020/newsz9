import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCategories } from "@/lib/data";
import { maybeCreateServiceClient } from "@/lib/supabase";
import type { Author } from "@/types";

export default async function NewArticlePage() {
  const supabase = maybeCreateServiceClient();
  const categories = await getCategories();

  let authors: Author[] = [];
  let tags: { id: string; name: string; slug: string }[] = [];

  if (supabase) {
    const [authorsRes, tagsRes] = await Promise.all([
      supabase.from("authors").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
    ]);
    authors = (authorsRes.data ?? []) as Author[];
    tags = (tagsRes.data ?? []) as { id: string; name: string; slug: string }[];
  }

  return (
    <ArticleForm
      authors={authors}
      availableTags={tags}
      categories={categories}
    />
  );
}
