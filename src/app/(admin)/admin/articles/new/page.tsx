import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCategories } from "@/lib/data";

export default async function NewArticlePage() {
  const categories = await getCategories();

  return <ArticleForm categories={categories} />;
}
