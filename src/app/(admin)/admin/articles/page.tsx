import { ArticleManagerTable } from "@/components/admin/ArticleManagerTable";
import Link from "next/link";
import { getAdminArticles } from "@/lib/data";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles(200);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Articles</h1>
        <Link
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          href="/admin/articles/new"
        >
          New Article
        </Link>
      </div>
      <ArticleManagerTable articles={articles} />
    </div>
  );
}
